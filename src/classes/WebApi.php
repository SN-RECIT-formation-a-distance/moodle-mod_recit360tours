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
    // Strict whitelist: prevents arbitrary method invocation via the 'service' param.
    protected static $allowedServices = [
        'getCmList', 'getSectionList', 'get360Tour', 'getTourCompletion',
        'getImage360FormKit', 'getSceneFormKit', 'deleteScene', 'saveScene',
        'deleteObject', 'saveObjectView', 'saveObject', 'saveFile', 'deleteFile',
    ];

    public function __construct($DB, $COURSE, $USER){
        parent::__construct($DB, $COURSE, $USER);
        PersistCtrl::getInstance($DB, $USER);
    }

    /**
     * Enforce Moodle capability checks.
     * $level 'a' = editing teacher / manager (addinstance), 's' = enrolled student (view).
     */
    public function canUserAccess($level, $cmId = 0, $userId = 0, $courseId = 0){
        if ($cmId == 0) {
            throw new \moodle_exception('accessdenied', 'admin');
        }
        $context = \context_module::instance($cmId);
        if ($level === 'a') {
            require_capability('mod/recit360tours:addinstance', $context);
        } else {
            require_capability('mod/recit360tours:view', $context);
        }
        return true;
    }

    public function getCmList($request){
        try{
            $cmId = intval($request['cmId']);

            $this->canUserAccess('a', $cmId);

            list ($course, $cmo) = get_course_and_cm_from_cmId($cmId);
            $result = array();
            $modinfo = get_fast_modinfo($course->id);

            foreach ($modinfo->cms as $cm){
                if (!$cm->__get('url')) continue;
                $result[] = array('id' => $cm->id, 'name' => $cm->name, 'modname' => $cm->modname, 'url' =>  $cm->__get('url')->out().'&autolinkpopup=1');
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

            $this->canUserAccess('a', $cmId);

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

            $cm = get_coursemodule_from_instance('recit360tours', $tourId, 0, false, MUST_EXIST);
            $this->canUserAccess('s', $cm->id);

            $result = new stdClass();
            $result->sceneList = PersistCtrl::getInstance()->getSceneList($tourId);
            $result->lastScene = PersistCtrl::getInstance()->getLastViewedScene($tourId, $this->signedUser->id);
            $this->prepareJson($result);
            return new WebApiResult(true, $result);
        }
        catch(Exception $ex){
            return new WebApiResult(false, null, $ex->GetMessage());
        }
    }

    public function getTourCompletion($request){
        try{
            $tourId = intval($request['tourId']);

            $cm = get_coursemodule_from_instance('recit360tours', $tourId, 0, false, MUST_EXIST);
            $this->canUserAccess('s', $cm->id);

            $result = new stdClass();
            $result->completion = PersistCtrl::getInstance()->getTourCompletion($tourId, $this->signedUser->id);
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

            $cm = get_coursemodule_from_instance('recit360tours', $tourId, 0, false, MUST_EXIST);
            $this->canUserAccess('a', $cm->id);

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
            $cmId = intval($request['cmId'] ?? 0);

            if ($resourceId > 0) {
                // Derive cmId from the scene record to prevent IDOR.
                $scene = PersistCtrl::getInstance()->getScene($resourceId);
                if (!$scene) {
                    throw new \moodle_exception('invalidrecord');
                }
                $cmId = $scene->cmId;
            }

            $this->canUserAccess('a', $cmId);

            $result = ($resourceId == 0 ? new Scene() : $scene);
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

            if (!isset($data->cmId) || !is_numeric($data->cmId)) {
                throw new Exception('Invalid data: missing cmId');
            }
            if (!isset($data->tourId) || !is_numeric($data->tourId)) {
                throw new Exception('Invalid data: missing tourId');
            }

            $data->id        = isset($data->id) ? intval($data->id) : 0;
            $data->cmId      = intval($data->cmId);
            $data->tourId    = intval($data->tourId);
            $data->name      = isset($data->name) ? clean_param($data->name, PARAM_TEXT) : '';
            $data->startscene = isset($data->startscene) ? intval($data->startscene) : 0;
            $data->key       = isset($data->key) ? clean_param($data->key, PARAM_ALPHANUMEXT) : '';

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

            $this->canUserAccess('s', $cmId);

            // IDOR: ensure the object actually belongs to this course module.
            if (!PersistCtrl::getInstance()->objectBelongsToCm($objectId, $cmId)) {
                throw new \moodle_exception('accessdenied', 'admin');
            }

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

            if (!isset($data->sceneId) || !is_numeric($data->sceneId)) {
                throw new Exception('Invalid data: missing sceneId');
            }

            $data->id         = isset($data->id) ? intval($data->id) : 0;
            $data->sceneId    = intval($data->sceneId);
            $data->type       = isset($data->type) ? clean_param($data->type, PARAM_ALPHA) : '';
            $data->completion = isset($data->completion) ? intval($data->completion) : 0;

            // Derive cmId from the scene to prevent cross-scene IDOR.
            $scene = PersistCtrl::getInstance()->getScene($data->sceneId);
            if (!$scene) {
                throw new \moodle_exception('invalidrecord');
            }
            $this->canUserAccess('a', $scene->cmId);

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

            if (!isset($data->cmId) || !is_numeric($data->cmId)) {
                throw new Exception('Invalid data: missing cmId');
            }
            $data->cmId = intval($data->cmId);

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

            if (!isset($data->cmId) || !is_numeric($data->cmId)) {
                throw new Exception('Invalid data: missing cmId');
            }
            $data->cmId = intval($data->cmId);

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
