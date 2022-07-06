<?php
namespace recit360tours;

require_once "$CFG->dirroot/local/recitcommon/php/PersistCtrl.php";

/*if (file_exists($CFG->libdir.'/../filter/embedquestion/filter.php')){
    require_once($CFG->libdir.'/../filter/embedquestion/filter.php');
}*/


use recitcommon;
use stdClass;
use Exception;
use context_course;

class PersistCtrl extends recitcommon\MoodlePersistCtrl
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


    public function getImage360List($cmId){
        global $PAGE;

        $query = "select t1.id, t1.cmid as cmId, t1.name, t1.type, t1.startscene, t2.course as courseId, t1.objects
                 from {$this->prefix}mod_recit360tours_scene as t1
                 inner join {$this->prefix}course_modules as t2 on t1.cmid = t2.id
                where t1.cmid = $cmId order by t1.startscene desc, t1.id";
                
        $result = $this->mysqlConn->execSQLAndGetObjects($query);

        if(count($result) > 0){
			$context = \context_module::instance(current($result)->cmId);
        }

        foreach($result as $item){
            $this->processResourceData($item);
        }        
        
        return $result;
    }

    public function getResource($resourceId){
        global $PAGE;

        $query = "select t1.id, t1.cmid as cmId, t1.name, t1.type, t1.startscene, t1.objects
                 from {$this->prefix}mod_recit360tours_scene as t1
                 inner join {$this->prefix}course_modules as t2 on t1.cmid = t2.id
                where t1.id = $resourceId";
                
        $result = $this->mysqlConn->execSQLAndGetObject($query);

        $this->processResourceData($result);

        return $result;
    }

    public function deleteResource($resourceId){  
        try{  
            $this->mysqlConn->beginTransaction();

            $query = "delete from {$this->prefix}mod_recit360tours_scene where id = $resourceId";
            $this->mysqlConn->execSQL($query);
            
            $this->mysqlConn->commitTransaction();

            return true;
        }
        catch(Exception $ex){
            $this->mysqlConn->rollbackTransaction();
            throw $ex;
        }
        return true;
    }

    public function processResourceData(&$result){
        if(!empty($result)){
			$context = \context_module::instance($result->cmId);
            //$PAGE->set_context($context);

            try {
                $result->objects = json_decode($result->objects);
                if ($result->type == 'file'){
                    $result->objects->srcUrl = \moodle_url::make_pluginfile_url($context->id, 'mod_recit360tours', 'resources', 0, '/', $result->objects->src)->out();
                    if (isset($result->objects->children)){
                        foreach ($result->objects->children as $d){
                            if (isset($d->file)){
                                if (is_string($d->file)){
                                    $d->fileUrl = \moodle_url::make_pluginfile_url($context->id, 'mod_recit360tours', 'resources', 0, '/', $d->file)->out();
                                }
                            }
                        }
                    }
                }
            }catch(Exception $e){
                $result->objects = array();
            }
        }
    }

    public function saveResource($data){
        try{		
			$context = \context_module::instance($data->cmId);
           
            $data->timeModified = time();
            
            if (isset($data->objects->src->content)){
                $filesave = $data->objects->src;
                $data->objects->src = uniqid().'_'.$filesave->fileName;
                
                $fs = get_file_storage();
                $file = substr($filesave->content, strpos($filesave->content, ',') + 1, strlen($filesave->content));

                // Prepare file record object
                $fileinfo = array(
                    'contextid' => $context->id, // ID of context
                    'component' => 'mod_recit360tours',     // usually = table name
                    'filearea' => 'resources',     // usually = table name
                    'itemid' => 0,               // usually = ID of row in table
                    'filepath' => '/',           // any path beginning and ending in /
                    'filename' => $data->objects->src); // any filename
                
                $fs->create_file_from_string($fileinfo, base64_decode($file));
            }
             
            $fields = array("cmid", "name", "type", "timemodified", "creatorid", "startscene", "objects");
            $values = array($data->cmId, $data->name, $data->type, $data->timeModified, $this->signedUser->id, $data->startscene, json_encode($data->objects));

            if ($data->startscene == 1){//If this is the start scene, update others to 0
                $this->mysqlConn->execSQL("UPDATE {$this->prefix}mod_recit360tours_scene SET startscene=0 where cmid = ".$data->cmId);
            }

            if($data->id == 0){
                $query = $this->mysqlConn->prepareStmt("insert", "{$this->prefix}mod_recit360tours_scene", $fields, $values);
                $this->mysqlConn->execSQL($query);

                $data->id = $this->mysqlConn->getLastInsertId("{$this->prefix}mod_recit360tours_scene", "id");
            }
            else{
                $query = $this->mysqlConn->prepareStmt("update", "{$this->prefix}mod_recit360tours_scene", $fields, $values, array("id"), array($data->id));
                $this->mysqlConn->execSQL($query);
            }
                           
            return $data;
        }
        catch(Exception $ex){
            throw $ex;
        }
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

   /* public function getPage($cmId, $pageId, $selectedFields = array(), $filtered = true){
        $result = $this->getPages($cmId, $pageId, $selectedFields, $filtered);
        return current($result);        
    }

    public function savePageSetup($data){
        global $DB;
        global $PAGE;
        try{		
			$context = context_course::instance($data->courseId);

            if(empty($data->creatorId)){
                $data->creatorId = $this->signedUser->id;
            }

            if (isset($data->content)){
                $data->content->text = file_save_draft_area_files($data->content->itemid, $context->id, 'mod_recit360tours', 'pagecontent', $data->creatorId, array('subdirs'=>true), $data->content->text);	
            }else{
                $data->content->text = '';
                $data->content->itemid = 0;
            }

            $data->timeModified = time();
            
            $fields = array("raid", "name", "contenttext", "contentitemid", "timemodified", "creatorId");
            $values = array($data->raId, $data->name, $data->content->text, $data->content->itemid, $data->timeModified, $data->creatorId);
            
            if($data->pageId == 0){
                $curSlot = $this->mysqlConn->execSQLAndGetObject("select slot from {$this->prefix}recit360tours_pages where raid = $data->raId order by slot desc limit 1");
                $fields[] = "slot";
                $values[] = (empty($curSlot) ? 1 : $curSlot->slot + 1);

                $query = $this->mysqlConn->prepareStmt("insert", "{$this->prefix}recit360tours_pages", $fields, $values);
                $this->mysqlConn->execSQL($query);

                $data->pageId = $this->mysqlConn->getLastInsertId("{$this->prefix}recit360tours_pages", "id");
            }
            else{
                $query = $this->mysqlConn->prepareStmt("update", "{$this->prefix}recit360tours_pages", $fields, $values, array("id"), array($data->pageId));
                $this->mysqlConn->execSQL($query);
            }

            if (isset($data->data)){
                foreach($data->data as $k => $v){
                    $value = $v->value;
                    if ($v->type == 'file'){
                        $fs = get_file_storage();
                        $value = uniqid().'_'.$v->fileName;
                        $file = substr($v->value, strpos($v->value, ',') + 1, strlen($v->value));

                        // Prepare file record object
                        $fileinfo = array(
                            'contextid' => $context->id, // ID of context
                            'component' => 'mod_recit360tours',     // usually = table name
                            'filearea' => 'pagedata',     // usually = table name
                            'itemid' => 0,               // usually = ID of row in table
                            'filepath' => '/',           // any path beginning and ending in /
                            'filename' => $value); // any filename
                        
                        $fs->create_file_from_string($fileinfo, base64_decode($file));
                    }
                    $DB->execute("insert into {recitact_pagedata} (pageid, name, type, value)
                    values(?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE value = ?", [$data->pageId, $k, $v->type, $value, $value]);
                }
            }
               
            return $this->getPage($data->cmId, $data->pageId);
        }
        catch(Exception $ex){
            throw $ex;
        }
    }

    public function setDisplayType($cmId, $value){
        $query = "update {$this->prefix}recit360tours as t1 
                    inner join {$this->prefix}course_modules as t2 on t1.course = t2.course and t1.id = t2.instance
                    inner join {$this->prefix}modules as t3 on t2.module = t3.id and t3.name = 'recit360tours'
                    set t1.displaytype = $value
                    where t2.id = $cmId";
        return $this->mysqlConn->execSQL($query);
    }

    public function removePage($pageId){  
        try{  
            $this->mysqlConn->beginTransaction();

            $query = "delete from {$this->prefix}recit360tours_pages_views where rapageid = $pageId";
            $this->mysqlConn->execSQL($query);

            $query = "delete from {$this->prefix}recit360tours_pages where id = $pageId";
            $this->mysqlConn->execSQL($query);

            $query = "delete from {$this->prefix}recitact_pagedata where pageid = $pageId";
            $this->mysqlConn->execSQL($query);
            
            $this->mysqlConn->commitTransaction();

            return true;
        }
        catch(Exception $ex){
            $this->mysqlConn->rollbackTransaction();
            throw $ex;
        }
        return true;
    }

    public function setPageView($pageId, $userId){  
        try{
            $query = "select id from {$this->prefix}recit360tours_pages_views where rapageid = $pageId and userid = $userId";
            $obj = $this->mysqlConn->execSQLAndGetObject($query);

            if($obj == null){
                $timeFirstView = time();
                $query = "insert into {$this->prefix}recit360tours_pages_views (rapageid, userid, nbviews, timefirstview, timeLastView) values ($pageId, $userId, 1, '$timeFirstView', '$timeFirstView')";
                $this->mysqlConn->execSQL($query);
            }
            else{
                $query = "update {$this->prefix}recit360tours_pages_views set nbviews = nbviews + 1, timeLastView = UNIX_TIMESTAMP() where rapageid = $pageId and userid = $userId";
                $this->mysqlConn->execSQL($query);
            }

            return true;
        }
        catch(Exception $ex){
            throw $ex;
        }
        return true;
    }

    public function switchPageSlot($from, $to){
        try{
            $this->mysqlConn->beginTransaction();
            $tmp = $this->mysqlConn->execSQLAndGetObjects("select slot from {$this->prefix}recit360tours_pages where id in ($from, $to) order by FIELD(id, $from, $to)");

            // $tmp[0] = from
            // $tmp[1] = to
            if(!isset($tmp[0]) || !isset($tmp[1])){
                throw new Exception("Unknown slots");
            }

            $query = sprintf("update {$this->prefix}recit360tours_pages set slot = %d where id = %d", $tmp[1]->slot, $from);
            $this->mysqlConn->execSQL($query);

            $query = sprintf("update {$this->prefix}recit360tours_pages set slot = %d where id = %d", $tmp[0]->slot, $to);
            $this->mysqlConn->execSQL($query);

            $this->mysqlConn->commitTransaction();

            return true;
        }
        catch(Exception $ex){
            $this->mysqlConn->rollbackTransaction();
            throw $ex;
        }
    }

    public function getPagesEvaluation($cmId, $userId, $pageId = 0, $selectedFields = array()){
        $optionsFields = array(
            'name' => 't1.name', 
            'displayType' => 'coalesce(t2.displaytype,0) as displayType', 
            'timeModified' => 'from_unixtime(t1.timemodified) as timeModified', 
            'content' => 't1.contenttext as _contentText, t1.contentitemid as _contentItemId', 
            'userId' => 'coalesce(t5.userid,0) as userId',
            'nbViews' => 'coalesce(t5.nbviews, 0) as nbViews',
            'grade' => 'coalesce(t5.grade, 0) as grade',
            'timeFirstView' => "coalesce(from_unixtime(t5.timefirstview),'') as timeFirstView",
            'timeLastView' => "coalesce(from_unixtime(t5.timelastview),'') as timeLastView"
        );

        $fields = array('t1.id as pageId', 't1.raid as raId', 't1.slot', 't2.course as courseId', 't3.id as cmId', 't1.creatorid as creatorId', 't5.id as pageViewId', 't5.timefirstview as timestampFirstView', 't5.timelastview as timestampLastView');
        foreach($selectedFields as $option){
            if(isset($optionsFields[$option])){
                $fields[] = $optionsFields[$option];
            }
        }
        $fields = implode(", ", $fields);

        $whereStmt = "";
        if($pageId > 0){
            $whereStmt = " and t1.id = $pageId ";
        }

        $query = "select $fields
                 from {$this->prefix}recit360tours_pages as t1
                inner join {$this->prefix}recit360tours as t2 on t1.raid = t2.id
                inner join {$this->prefix}course_modules as t3 on t2.course = t3.course and t2.id = t3.instance
                inner join {$this->prefix}modules as t4 on t3.module = t4.id and t4.name = 'recit360tours'
                left join {$this->prefix}recit360tours_pages_views as t5 on t1.id = t5.rapageid and t5.userid = $userId
                where t3.id = $cmId $whereStmt
                order by t1.slot asc";
                
        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);

        if(count($tmp) > 0){
		
			foreach($tmp as $item){
                if ($item->pageViewId == 0){
                    $query = "insert into {$this->prefix}recit360tours_pages_views (rapageid, userid, nbviews, timefirstview, timeLastView) values ($pageId, $userId, 0, '0', '0')";
                    $item->pageViewId = $this->mysqlConn->execSQL($query);
                }
                if ($item->timestampFirstView == 0){
                    $item->timeFirstView = '';
                }
                if ($item->timestampLastView == 0){
                    $item->timeLastView = '';
                }
			}        
        }
        
        return $tmp;
    }

    public function getPageEvaluation($cmId, $userId, $pageId, $selectedFields = array()){
        $result = $this->getPagesEvaluation($cmId, $userId, $pageId, $selectedFields);
        return current($result);   
    }

    public function getUsersGrades($instanceId, $userId = 0){
        $where = "";
        if ($userId > 0){
            $where = "and t5.userid=$userId";
        }
        $query = "select t1.name,coalesce(t5.userid,0) as userid, coalesce(t5.nbviews, 0) as nbViews,sum(t5.grade) as grade, t3.id as cmId
                 from {$this->prefix}recit360tours_pages as t1
                inner join {$this->prefix}recit360tours as t2 on t1.raid = t2.id
                inner join {$this->prefix}course_modules as t3 on t2.course = t3.course and t2.id = t3.instance
                inner join {$this->prefix}modules as t4 on t3.module = t4.id and t4.name = 'recit360tours'
                left join {$this->prefix}recit360tours_pages_views as t5 on t1.id = t5.rapageid
                where t2.id = $instanceId $where group by t5.userid
                ";
                
        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        if (count($tmp) > 0){
            $questions = $this->getEmbedQuestions(current($tmp)->cmId);
            foreach($tmp as &$n){
                foreach ($questions as $q){
                    $n->grade += $this->getQuestionGrade($q->id, $userId);
                }
            }
        }
        
        return $tmp;
    }

    public function savePageEval($data){
        global $DB;
        try{		
            $fields = array("grade");
            $values = array($data->grade);

            $query = $this->mysqlConn->prepareStmt("update", "{$this->prefix}recit360tours_pages_views", $fields, $values, array("id"), array($data->pageViewId));
            $this->mysqlConn->execSQL($query);
            $modinfo = get_fast_modinfo($data->courseId);
            $cm = $modinfo->get_cm($data->cmId);
            $cmdata = $DB->get_record('recit360tours', array('id'=>$cm->instance));
            $cmdata->instance = $cm->instance;
            recit360tours_update_grades($cmdata, $data->userId);
               
            return true;
        }
        catch(Exception $ex){
            throw $ex;
        }
    }

    public function getEmbedQuestions($cmId){
        global $CFG, $DB;
        $ar = array();

        $pages = $this->getPages($cmId, 0, array('content'), false);
    
        foreach ($pages as $p){
            preg_match(\filter_embedquestion::get_filter_regexp(), $p->content->text, $matches);
            if (count($matches) == 0) continue;
        
            foreach ($matches as $m){
                
                $parts = explode('|', $m);
        
                if (count($parts) < 2) {
                    continue;
                }
        
                $questioninfo = array_shift($parts);
        
                if (strpos($questioninfo, '/') === false) {
                    continue;
                }
        
                list($categoryidnumber, $questionidnumber) = explode('/', $questioninfo, 2);
                
                $category = $DB->get_record_select('question_categories', 'idnumber = ?', [$categoryidnumber]);
                if (!$category) {
                    continue;
                }
        
                
                $question = $DB->get_record_select('question', "category = ? AND idnumber = ? AND hidden = 0 AND parent = 0", [$category->id, $questionidnumber]);
                if (!$question) {
                    continue;
                }
        
                $ar[] = $question;
            }
        }
    
        return $ar;
    }

    public function getQuestionGrade($qid, $userid){
        $query = "SELECT t2.userid as userid, t1.maxmark as mark FROM `{$this->prefix}question_attempts` t1 inner join `{$this->prefix}question_attempt_steps` as t2 on t2.questionattemptid = t1.id and t2.userid = $userid and t2.state = 'gradedright' where t1.questionid = $qid limit 1";
                
        $tmp = $this->mysqlConn->execSQLAndGetObjects($query);
        if (empty($tmp)) return 0;
        return current($tmp)->mark;
    }*/
}

class Resource{
    public $id = 0;
    public $courseId = 0;
    public $cmId = 0;
    public $startscene = 0;
    public $name = '';
    public $type = '';
    public $value = null;
    public $url = '';
    public $objects = array('src' => null);
}

/*
class ActivityPage
{
    public $courseId = 0;
    public $cmId = 0;
    public $raId = 0;
    public $pageId = 0;
    public $name = "";
    public $displayType = 0;
    public $_contentText = "";
    public $_contentItemId = 0;
    public $content = null;
    public $timeModified = 0;
    public $slot = 0;
    public $data = array('image' => null);

    public function __construct(){
        $this->content = new stdClass();
        $this->content->text = "";
        $this->content->itemid = 0;
    }

    public function addData($key, $value){
        $this->data[$key] = $value;
    }

    public function getData(){
        global $DB, $PAGE, $CFG;

        $data = $DB->get_records('recitact_pagedata', array('pageid' => $this->pageId));
        foreach ($data as $d){
            $do = array('key' => $d->name, 'value' => $d->value, 'type' => $d->type);
            if ($d->type == 'file'){
                $do['url'] = \moodle_url::make_pluginfile_url($PAGE->context->id, 'mod_recit360tours', 'pagedata', 0, '/', $d->value)->out();
            }
            $this->addData($d->name, $do);
        }
    }
}*/