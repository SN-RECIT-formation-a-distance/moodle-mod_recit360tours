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

/**
 *
 * @package   mod_recit360tours
 * @copyright 2019 RÉCIT FAD
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

//require_once($CFG->dirroot . "/local/recitcommon/php/PersistCtrl.php");
require_once($CFG->libdir.'/gradelib.php');
require_once(dirname(__FILE__) . "/classes/PersistCtrl.php");

/**
 * List of features supported in recit360tours module
 * @param string $feature FEATURE_xx constant for requested feature
 * @return mixed True if module supports feature, false if not, null if doesn't know
 */
function recit360tours_supports($feature) {
    switch($feature) {
        //case FEATURE_ARCHETYPE:           return ARCHETYPE_RESOURCE;
        //case FEATURE_GROUPS:                  return false;
        //case FEATURE_GROUPINGS:               return false;
        case FEATURE_MOD_INTRO:               return true;
        case FEATURE_COMPLETION_TRACKS_VIEWS: return true;
        //case FEATURE_GRADE_HAS_GRADE:         return true;
        case FEATURE_COMPLETION_HAS_RULES:         return true;
        //case FEATURE_GRADE_OUTCOMES:          return true;
        case FEATURE_BACKUP_MOODLE2:          return true;
        case FEATURE_SHOW_DESCRIPTION:        return true;
        case FEATURE_MOD_PURPOSE: return MOD_PURPOSE_COMMUNICATION;

        default: return null;
    }
}

/**
 * Add recit360tours instance.
 * @param object $data
 * @param object $mform
 * @return int new recit360tours instance id
 */
function recit360tours_add_instance($data, $mform) {
    global $CFG, $DB;

    $data->timemodified = time();
    $data->id = $DB->insert_record('recit360tours', $data);
    return $data->id;
}

/**
 * Update recit360tours instance.
 * @param object $data
 * @param object $mform
 * @return bool true
 */
function recit360tours_update_instance($data, $mform) {
    global $CFG, $DB;

    $data->timemodified = time();
    $data->id           = $data->instance;

    $DB->update_record('recit360tours', $data);

    return true;
}

/**
 * Delete recit360tours instance.
 * @param int $id
 * @return bool true
 */
function recit360tours_delete_instance($id) {
    global $DB, $USER, $CFG;
    if (!$recit360tours = $DB->get_record('recit360tours', array('id'=>$id))) {
        return true;
    }

    try {
        $DB->execute("DELETE FROM {recit360tours_views} WHERE objectid IN (SELECT id FROM {recit360tours_objects} WHERE sceneid IN (SELECT id FROM {recit360tours_scenes} WHERE tourid=?))", [$id]);
        $DB->execute("DELETE FROM {recit360tours_objects} WHERE sceneid IN (SELECT id FROM {recit360tours_scenes} WHERE tourid=?)", [$id]);
        $DB->delete_records('recit360tours', array('id'=>$recit360tours->id));
        $DB->delete_records('recit360tours_scenes', array('tourid'=>$recit360tours->id));
    } catch(Exception $e){}

    return true;
}

function recit360tours_reset_userdata($data) {
    global $DB, $USER;
    if (!empty($data->reset_userdata)) {
        $recitact = $DB->get_records('recit360tours', array('course'=>$data->courseid));
        foreach ($recitact as $v){
            $id = $v->id;
            $DB->execute("DELETE FROM {recit360tours_views} WHERE objectid IN (SELECT id FROM {recit360tours_objects} WHERE sceneid IN (SELECT id FROM {recit360tours_scenes} WHERE tourid=?))", [$id]);
        }
    }
    return array(
        array('component' => get_string('modulenameplural', 'recit360tours'),
        'item' => get_string('modulenameplural', 'recit360tours'),
        'error' => false)
    );
}

function recit360tours_reset_course_form_defaults($course) {
    return array('reset_userdata' => 1);
}

function recit360tours_reset_course_form_definition(&$mform) {
    $mform->addElement('header', 'recitheader', get_string('modulenameplural', 'recit360tours'));

    $mform->addElement('checkbox', 'reset_userdata', get_string('reset'));

}

/**
 * This flags this module with the capability to override the completion status with the custom completion rules.
 *
 * @return int
 */
function recit360tours_get_completion_aggregation_state() {
    return COMPLETION_CUSTOM_MODULE_FLOW;
}

/**
 * Given a course_module object, this function returns any
 * "extra" information that may be needed when printing
 * this activity in a course listing.
 * See get_array_of_activities() in course/lib.php.
 *
 * @param stdClass $coursemodule
 *
 * @return null|cached_cm_info
 */
function recit360tours_get_coursemodule_info($coursemodule) {
    global $DB;

    $dbparams = ['id' => $coursemodule->instance];
    $recit360tours = $DB->get_record('recit360tours', $dbparams);
    if (!$recit360tours) {
        return null;
    }
    $info = new cached_cm_info();
    $info->name = $recit360tours->name;
    if ($coursemodule->showdescription) {
        // Convert intro to html. Do not filter cached version, filters run at display time.
        $info->content = format_module_intro('recit360tours', $recit360tours, $coursemodule->id, false);
    }
    // Populate the custom completion rules as key => value pairs, but only if the completion mode is 'automatic'.
    if ($coursemodule->completion == COMPLETION_TRACKING_AUTOMATIC) {
        $info->customdata['customcompletionrules']['completionobjects'] = $recit360tours->completionobjects;
    }

    return $info;
}

/**
* Obtains the automatic completion state for this forum based on any conditions
* in forum settings.
*
* @param object $course Course
* @param object $cm Course-module
* @param int $userid User ID
* @param bool $type Type of comparison (or/and; can be used as return value if no conditions)
* @return bool True if completed, false if not, $type if conditions not set.
*/
function recit360tours_get_completion_state($course,$cm,$userid,$type) {
   global $CFG,$DB,$USER;

   // Get forum details
   $recit360tours = $DB->get_record('recit360tours', array('id' => $cm->instance), '*', MUST_EXIST);

   // If completion option is enabled, evaluate it and return true/false 
   if($recit360tours->completionobjects) {
        $ctrl = recit360tours\PersistCtrl::getInstance($DB, $USER);
        return $ctrl->isTourCompleted($cm->instance, $userid);
   } else {
       // Completion option is not enabled so just return $type
       return $type;
   }
}

/*
function recit360tours_check_completion($cmid, $userid){
    global $DB,$USER;

    $ctrl = recit360tours\PersistCtrl::getInstance($DB, $USER);
    $ctrl->check_activity_completion($cmid, $userid);
}*/

function recit360tours_pluginfile($course, $cm, $context, $filearea, $args, $forcedownload, array $options=array()) {
    global $DB;

    if ($filearea == 'resources') {
        $data = $DB->get_records_sql('select * from {files} where contextid = ? and filename = ?', array($context->id, $args[1]));
        $data = array_values($data);

        if (!$data || !$data[0]){
            return false;
        }

        $fs = get_file_storage();
		$file = $fs->get_file_by_hash($data[0]->pathnamehash);
        
        if($file == false){
            return false;
        }
        
        if ($file->is_directory()){		
            return false;
        }

        send_stored_file($file, null, 0, $options);
    }
}