<?php
namespace recit360tours;

require_once dirname(__FILE__)."/recitcommon/PersistCtrl.php";
require_once "$CFG->dirroot/lib/completionlib.php";


use recitcommon;
use stdClass;
use Exception;
use context_course;

class PersistCtrl extends MoodlePersistCtrl
{
    protected static $instance = null;
	
	/**
     * @param MySQL Resource
     * @return PersistCtrl
     */
    public static function getInstance($mysqlConn = null, $signedUser = null)
    {
        if(!isset(self::$instance)) {
            self::$instance = new self($mysqlConn, $signedUser);
        }
        return self::$instance;
    }
	
	protected function __construct($mysqlConn, $signedUser){
		parent::__construct($mysqlConn, $signedUser);
    }


    public function getSceneList($tourId){
        $query = "select t1.id, t1.tourid as tourid, t1.name, t1.image, t1.startscene, t2.id as objectid, t2.object, t2.completion as objectcompletion, t3.id as cmid, t1.scene_key
                 from {$this->prefix}recit360tours_scenes t1
                 inner join {$this->prefix}course_modules t3 on instance = t1.tourid and module = (select id from {$this->prefix}modules where name = 'recit360tours')
                 left join {$this->prefix}recit360tours_objects t2 on t1.id = t2.sceneid
                where t1.tourid = $tourId order by t1.startscene desc, t1.id";
        
        $result = $this->mysqlConn->execSQLAndGetObjects($query);

        $list = array();
        foreach($result as $item){
            if (!isset($list[$item->id])){
                $list[$item->id] = new Scene($item);
            }
            $list[$item->id]->addObject($item);
        }
        
        return array_values($list);
    }

    public function getScene($sceneId){

        $query = "select t1.id, t1.tourid as tourid, t1.name, t1.image, t1.startscene, t2.id as objectid, t2.object, t2.completion as objectcompletion, t3.id as cmid, t1.scene_key
                 from {$this->prefix}recit360tours_scenes t1
                 left join {$this->prefix}recit360tours_objects t2 on t1.id = t2.sceneid
                 inner join {$this->prefix}course_modules t3 on instance = t1.tourid and module = (select id from {$this->prefix}modules where name = 'recit360tours')
                where t1.id = $sceneId";
                
        $result = $this->mysqlConn->execSQLAndGetObjects($query);

        $list = array();
        foreach($result as $item){
            if (!isset($list[$item->id])){
                $list[$item->id] = new Scene($item);
            }
            $list[$item->id]->addObject($item);
        }

        return array_pop($list);
    }

    public function deleteScene($sceneId){  
        global $DB;
        try {
            $DB->execute("DELETE FROM {recit360tours_views} WHERE objectid IN (SELECT id FROM {recit360tours_objects} WHERE sceneid=$sceneId)");
            $DB->delete_records('recit360tours_scenes', array('id'=>$sceneId));
            $DB->delete_records('recit360tours_objects', array('sceneid'=>$sceneId));
        }catch (Exception $e){}
        return true;
    }

    public function saveScene($data){
        try{		
			$context = \context_module::instance($data->cmId);
           
            $data->timeModified = time();
             
            $fields = array("tourid", "name", "timemodified", "creatorid", "startscene", "scene_key");
            $values = array($data->tourId, $data->name, $data->timeModified, $this->signedUser->id, $data->startscene, $data->key);
            
            if (isset($data->image->content)){
                $filesave = $data->image;
                $data->image = uniqid().'_'.$filesave->fileName;
                
                $fs = get_file_storage();
                $file = substr($filesave->content, strpos($filesave->content, ',') + 1, strlen($filesave->content));

                // Prepare file record object
                $fileinfo = array(
                    'contextid' => $context->id, // ID of context
                    'component' => 'mod_recit360tours',     // usually = table name
                    'filearea' => 'resources',     // usually = table name
                    'itemid' => 0,               // usually = ID of row in table
                    'filepath' => '/',           // any path beginning and ending in /
                    'filename' => $data->image); // any filename
                
                $fs->create_file_from_string($fileinfo, base64_decode($file));
                $fields[] = "image";
                $values[] = $data->image;
            }

            if ($data->startscene == 1){//If this is the start scene, update others to 0
                $this->mysqlConn->execSQL("UPDATE {$this->prefix}recit360tours_scenes SET startscene=0 where tourid = ".$data->tourId);
            }

            if($data->id == 0){
                $query = $this->mysqlConn->prepareStmt("insert", "{$this->prefix}recit360tours_scenes", $fields, $values);
                $this->mysqlConn->execSQL($query);

                $data->id = $this->mysqlConn->getLastInsertId("{$this->prefix}recit360tours_scenes", "id");
            }
            else{
                $query = $this->mysqlConn->prepareStmt("update", "{$this->prefix}recit360tours_scenes", $fields, $values, array("id"), array($data->id));
                $this->mysqlConn->execSQL($query);
            }
                           
            return $data;
        }
        catch(Exception $ex){
            throw $ex;
        }
    }

    public function deleteObject($objectId){  
        global $DB;
        $DB->delete_records('recit360tours_objects', array('id'=>$objectId));
        $DB->delete_records('recit360tours_views', array('objectid'=>$objectId));
        return true;
    }

    public function saveObject($data){
        try{
             
            $fields = array("sceneid", "type", "object", "completion");
            $values = array($data->sceneId, $data->type, json_encode($data->object), $data->completion);

            if($data->id == 0){
                $query = $this->mysqlConn->prepareStmt("insert", "{$this->prefix}recit360tours_objects", $fields, $values);
                $this->mysqlConn->execSQL($query);

                $data->id = $this->mysqlConn->getLastInsertId("{$this->prefix}recit360tours_objects", "id");
            }
            else{
                $query = $this->mysqlConn->prepareStmt("update", "{$this->prefix}recit360tours_objects", $fields, $values, array("id"), array($data->id));
                $this->mysqlConn->execSQL($query);
            }
                           
            return $data;
        }
        catch(Exception $ex){
            throw $ex;
        }
    }

    public function saveObjectView($objectId, $userId){
        global $DB;
        
        $timeViewed = time();
        
        $DB->execute("insert into {recit360tours_views} (objectid, userid, timeviewed)
        values($objectId, $userId, $timeViewed)
        ON DUPLICATE KEY UPDATE timeviewed = '$timeViewed'");

        return true;
    }

    public function getLastViewedScene($tourId, $userId){
        $query = "select t2.sceneid, t3.objectid, t2.type, t2.object
                 from {$this->prefix}recit360tours_scenes t1
                 left join {$this->prefix}recit360tours_objects t2 on t1.id = t2.sceneid
                 left join {$this->prefix}recit360tours_views t3 on t2.id = t3.objectid
                where t1.tourid = $tourId and t2.type = 'navigation' and t3.userid = $userId order by t3.timeviewed desc limit 1";
                
        $result = $this->mysqlConn->execSQLAndGetObject($query);
        
        return $result;
    }

    public function check_activity_completion($cmid, $userid){
        global $DB;
    
        $cm = get_coursemodule_from_id('recit360tours', $cmid, 0, false, MUST_EXIST);
        $tourid = $cm->instance;

        $recit360tours = $DB->get_record('recit360tours', array('id' => $tourid), '*', MUST_EXIST);
        $course = $DB->get_record('course', array('id' => $cm->course), '*', MUST_EXIST);
    
        $completion = new \completion_info($course);
        if($completion->is_enabled($cm) && $recit360tours->completionobjects) {
            if ($this->isTourCompleted($tourid, $userid)){                
                $completion->update_state($cm, COMPLETION_COMPLETE);
            }
        }
    }

    public function getTourCompletion($tourId, $userId){
        $completed = $this->mysqlConn->execSQLAndGetObject("select COUNT(t3.objectid) as count
        from {$this->prefix}recit360tours_scenes t1
        left join {$this->prefix}recit360tours_objects t2 on t1.id = t2.sceneid
        left join {$this->prefix}recit360tours_views t3 on t2.id = t3.objectid
        where t1.tourid = $tourId and t2.completion = 1 and t3.userid = $userId");

       $total = $this->mysqlConn->execSQLAndGetObject("select COUNT(t2.id) as count
       from {$this->prefix}recit360tours_scenes t1
       left join {$this->prefix}recit360tours_objects t2 on t1.id = t2.sceneid
       where t1.tourid = $tourId and t2.completion = 1");

        if (isset($completed->count) && isset($total->count)){
            return array('completed' => $completed->count, 'total' => $total->count);
        }
        return null;

    }
    public function isTourCompleted($tourId, $userId){
        $completed = $this->getTourCompletion($tourId, $userId);

        if (isset($completed['completed']) && $completed['completed'] == $completed['total']){
            return true;
        }
        return false;
    }

    public function saveFile($obj){
        $context = \context_module::instance($obj->cmId);
        $filesave = $obj->file;
        $obj->file = uniqid().'_'.$filesave->fileName;
        
        $fs = get_file_storage();
        $file = substr($filesave->content, strpos($filesave->content, ',') + 1, strlen($filesave->content));

        // Prepare file record object
        $fileinfo = array(
            'contextid' => $context->id, // ID of context
            'component' => 'mod_recit360tours',     // usually = table name
            'filearea' => 'resources',     // usually = table name
            'itemid' => 0,               // usually = ID of row in table
            'filepath' => '/',           // any path beginning and ending in /
            'filename' => $obj->file); // any filename
        try {
            $fs->create_file_from_string($fileinfo, base64_decode($file));
        }catch(Exception $e){}///Sometimes throws an error but saves anyway

        $obj->fileUrl = \moodle_url::make_pluginfile_url($context->id, 'mod_recit360tours', 'resources', 0, '/', $obj->file)->out();
        return $obj;
    }

    public function deleteFile($obj){
        $context = \context_module::instance($obj->cmId);
        
        $fs = get_file_storage();

        // Prepare file record object
        $fileinfo = array(
            'contextid' => $context->id, // ID of context
            'component' => 'mod_recit360tours',     // usually = table name
            'filearea' => 'resources',     // usually = table name
            'itemid' => 0,               // usually = ID of row in table
            'filepath' => '/',           // any path beginning and ending in /
            'filename' => $obj->file); // any filename
        // Get file
        $file = $fs->get_file($fileinfo['contextid'], $fileinfo['component'], $fileinfo['filearea'], 
                $fileinfo['itemid'], $fileinfo['filepath'], $fileinfo['filename']);
        
        // Delete it if it exists
        if ($file) {
            $file->delete();
        }
        return $obj;
    }

}

class Scene{
    public $id = 0;
    public $tourid = 0;
    public $cmId = 0;
    public $courseId = 0;
    public $startscene = 0;
    public $name = '';
    public $key = '';
    public $objects = array('src' => null, 'children' => array());

    public function __construct($data = null){
        if ($data){
            $this->id = $data->id;
            $this->key = $data->scene_key;
            $this->tourid = $data->tourid;
            $this->cmId = $data->cmid;
            $this->name = $data->name;
            $this->startscene = $data->startscene;
            $context = \context_module::instance($this->cmId);
            $this->objects['srcUrl'] = \moodle_url::make_pluginfile_url($context->id, 'mod_recit360tours', 'resources', 0, '/', $data->image)->out();
            list ($course, $cmo) = get_course_and_cm_from_cmId($this->cmId);
            $this->courseId = $course->id;
        }
    }
    
    
    public function addObject($data){
        if ($data->object){
            $context = \context_module::instance($this->cmId);
            $obj = json_decode($data->object);
            $obj->completion = $data->objectcompletion;
            $obj->id = $data->objectid;
            if (isset($obj->file)){
                if (is_string($obj->file)){
                    $obj->fileUrl = \moodle_url::make_pluginfile_url($context->id, 'mod_recit360tours', 'resources', 0, '/', $obj->file)->out();
                }
            }

            if ($obj->type == 'iframe'){
                if (isset($obj->activity) && is_string($obj->activity) && strlen($obj->activity) > 0){
                    $url = Utils::getCmUrlFromCmName($obj->activity, $this->courseId);
                    if ($url){
                        $obj->url = $url;
                    }
                }
            }

            $this->objects['children'][] = $obj;
        }
    }
}
