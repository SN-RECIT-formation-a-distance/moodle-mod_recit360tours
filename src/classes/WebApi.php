<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace recit360tours;

require_once(dirname(__FILE__).'../../../../config.php');
require_once dirname(__FILE__)."/recitcommon/WebApi.php";
require_once dirname(__FILE__) . "/PersistCtrl.php";

use stdClass;
use Exception;

/**
 *
 * @copyright  2020 RÉCIT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

class WebApi extends MoodleApi
{
    public function __construct($DB, $COURSE, $USER){
        parent::__construct($DB, $COURSE, $USER);
        PersistCtrl::getInstance($DB, $USER);
    }
        
    public function canUserAccess($level, $cmId = 0, $userId = 0, $courseId = 0){
        return true;
    }

    public function getCmList($request){        
        try{            
            $cmId = intval($request['cmId']);

            list ($course, $cmo) = get_course_and_cm_from_cmId($cmId);
            $result = array();
            $modinfo = get_fast_modinfo($course->id);

            foreach ($modinfo->cms as $cm){
                if (!$cm->__get('url')) continue;
                $result[] = array('id' => $cm->id, 'name' => $cm->name, 'modname' => $cm->modname, 'url' =>  $cm->__get('url')->out());
            }
            
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }
        
    public function getSectionList($request){        
        try{            
            $cmId = intval($request['cmId']);

            list ($course, $cm) = get_course_and_cm_from_cmId($cmId);
            $result = array();
            $modinfo = get_fast_modinfo($course->id);

            foreach ($modinfo->get_section_info_all() as $section){
                $result[] = array('id' => $section->section, 'name' => (empty($section->name) ? get_string('section') . '' . $section->section : $section->name));
            }
            
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function get360Tour($request){
        try{
            $tourId = intval($request['tourId']);
            
            $this->canUserAccess('s');

            $result = new stdClass();
            $result->sceneList = PersistCtrl::getInstance()->getSceneList($tourId);
            $result->lastScene =  PersistCtrl::getInstance()->getLastViewedScene($tourId, $this->signedUser->id);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function getImage360FormKit($request){
        try{
            $tourId = intval($request['tourId']);
            
            $this->canUserAccess('s');

            $result = PersistCtrl::getInstance()->getSceneList($tourId);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function getSceneFormKit($request){
        try{
            $resourceId = intval($request['resourceId']);

            //$this->canUserAccess('a', $cmId);          
            $result = ($resourceId == 0 ? new Scene() : PersistCtrl::getInstance()->getScene($resourceId));
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function deleteScene($request){
        try{
            $resourceId = intval($request['resourceId']);
            $cmId = intval($request['cmId']);

            $this->canUserAccess('a', $cmId);          
            $result = PersistCtrl::getInstance()->deleteScene($resourceId);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function saveScene($request){
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a', $data->cmId);

            $result = PersistCtrl::getInstance()->saveScene($data);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function deleteObject($request){
        try{
            $objectId = intval($request['objectId']);
            $cmId = intval($request['cmId']);

            $this->canUserAccess('a', $cmId);          
            $result = PersistCtrl::getInstance()->deleteObject($objectId);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function saveObjectView($request){
        try{
            $objectId = intval($request['objectId']);
            $cmId = intval($request['cmId']);

            $this->canUserAccess('s');          

            PersistCtrl::getInstance()->saveObjectView($objectId, $this->signedUser->id);
            
            PersistCtrl::getInstance()->check_activity_completion($cmId, $this->signedUser->id);
            
            return new WebApiResult(true);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function saveObject($request){
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a');

            $result = PersistCtrl::getInstance()->saveObject($data);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function saveFile($request){
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a', $data->cmId);

            $result = PersistCtrl::getInstance()->saveFile($data);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function deleteFile($request){
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a', $data->cmId);

            $result = PersistCtrl::getInstance()->deleteFile($data);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }
}

///////////////////////////////////////////////////////////////////////////////////
$webapi = new WebApi($DB, $COURSE, $USER);
$webapi->getRequest($_REQUEST);
$webapi->processRequest();
$webapi->replyClient();