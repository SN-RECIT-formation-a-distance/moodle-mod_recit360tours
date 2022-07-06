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
require_once "$CFG->dirroot/local/recitcommon/php/WebApi.php";
require_once dirname(__FILE__) . "/PersistCtrl.php";

use recitcommon;
use recitcommon\WebApiResult;
use stdClass;
use Exception;

/**
 *
 * @copyright  2020 RÉCIT
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

class WebApi extends recitcommon\MoodleApi
{
    public function __construct($DB, $COURSE, $USER){
        parent::__construct($DB, $COURSE, $USER);
        PersistCtrl::getInstance($DB, $USER);
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

    public function getImage360FormKit($request){
        try{
            $cmId = intval($request['cmId']);

            //$this->canUserAccess('a', $cmId);
           
            $result = PersistCtrl::getInstance()->getImage360List($cmId);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function getResourceFormKit($request){
        try{
            $resourceId = intval($request['resourceId']);

            //$this->canUserAccess('a', $cmId);          
            $result = ($resourceId == 0 ? new Resource() : PersistCtrl::getInstance()->getResource($resourceId));
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function deleteResource($request){
        try{
            $resourceId = intval($request['resourceId']);

            //$this->canUserAccess('a', $cmId);          
            $result = PersistCtrl::getInstance()->deleteResource($resourceId);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function saveResource($request){        
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a', $data->cmId);

            $result = PersistCtrl::getInstance()->saveResource($data);
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

    /*public function getPages($request){
        try{
            $cmId = intval($request['cmId']);

            $this->canUserAccess('a', $cmId);

            $result = new stdClass();
            $result->data = PersistCtrl::getInstance()->getPages($cmId, 0, array('name', 'displayType', 'timeModified'));
            $this->prepareJson($result);
            return new WebApiResult(true, $result->data);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

    public function getPageFormKit($request){
        try{
            $cmId = intval($request['cmId']);
            $pageId = intval($request['pageId']);
            $filtered = (isset($request['filtered']) && $request['filtered'] == 1);

            $this->canUserAccess('a', $cmId);

            $result = new stdClass();

            if($pageId == 0){
                list ($course, $cm) = get_course_and_cm_from_cmid($cmId, 'recit360tours');
                $result->data = new ActivityPage();
                $result->data->cmId = $cmId;
                $result->data->courseId = $course->id;
                $result->data->raId = $cm->instance;
            }
            else{
                $result->data = PersistCtrl::getInstance()->getPage($cmId, $pageId, array('name', 'displayType', 'content'), $filtered);
            }
            
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }

   

    public function savePageSetup($request){        
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a', $data->cmId);

            $result = PersistCtrl::getInstance()->savePageSetup($data);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function setDisplayType($request){
        try{            
            $cmId = intval($request['cmId']);
            $value = intval($request['value']);
            
            $this->canUserAccess('a', $cmId);

            PersistCtrl::getInstance()->setDisplayType($cmId, $value);
            return new WebApiResult(true, $value);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function removePage($request){        
        try{            
            $cmId = intval($request['cmId']);
            $pageId = intval($request['pageId']);

            $this->canUserAccess('a', $cmId);

            PersistCtrl::getInstance()->removePage($pageId);
            return new WebApiResult(true);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function getPagesEvaluation($request){        
        try{            
            $cmId = intval($request['cmId']);
            $userId = intval($request['userId']);

            $this->canUserAccess('s', $cmId, $userId);

            $result = PersistCtrl::getInstance()->getPagesEvaluation($cmId, $userId, 0, array('name', 'nbViews', 'userId', 'grade', 'timeFirstView', 'timeLastView'));
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function getPageEvaluation($request){        
        try{            
            $cmId = intval($request['cmId']);
            $pageId = intval($request['pageId']);
            $userId = intval($request['userId']);

            $this->canUserAccess('a', $cmId);

            $result = PersistCtrl::getInstance()->getPageEvaluation($cmId, $userId, $pageId, array('name', 'userId', 'grade'));
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function savePageEval($request){        
        try{            
            $data = json_decode(json_encode($request['data']), FALSE);

            $this->canUserAccess('a', $data->cmId);

            PersistCtrl::getInstance()->savePageEval($data);
            
            return new WebApiResult(true);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function getPageNav($request){        
        try{            
            $cmId = intval($request['cmId']);

            $this->canUserAccess('s', $cmId, $this->signedUser->id);

            $result = PersistCtrl::getInstance()->getPages($cmId, 0, array('name', 'displayType'));
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function getPageContent($request){        
        try{            
            $cmId = intval($request['cmId']);
            $pageId = intval($request['pageId']);
            $countPageViews = intval($request['countPageViews']);

            $this->canUserAccess('s', $cmId, $this->signedUser->id);

            $result = PersistCtrl::getInstance()->getPage($cmId, $pageId, array('content', 'displayType'));
            $this->prepareJson($result);

            if ($countPageViews == 1){
                PersistCtrl::getInstance()->setPageView($result->pageId, $this->signedUser->id);
            }

            return new WebApiResult(true, $result);
		}
		catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        } 
    }

    public function switchPageSlot($request){
        try{
            $cmId = intval($request['cmId']);

            $this->canUserAccess('a', $cmId);

            $from = intval($request['from']);
            $to = intval($request['to']);
            PersistCtrl::getInstance()->switchPageSlot($from, $to);
            return new WebApiResult(true);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }     
    }*/
}

///////////////////////////////////////////////////////////////////////////////////
$webapi = new WebApi($DB, $COURSE, $USER);
$webapi->getRequest($_REQUEST);
$webapi->processRequest();
$webapi->replyClient();