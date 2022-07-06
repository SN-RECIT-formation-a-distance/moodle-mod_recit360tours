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

use recit360tours\PersistCtrl;

/**
 * List of features supported in recit360tours module
 * @param string $feature FEATURE_xx constant for requested feature
 * @return mixed True if module supports feature, false if not, null if doesn't know
 */
function recit360tours_supports($feature) {
    switch($feature) {
        //case FEATURE_MOD_ARCHETYPE:           return MOD_ARCHETYPE_RESOURCE;
        //case FEATURE_GROUPS:                  return false;
        //case FEATURE_GROUPINGS:               return false;
        case FEATURE_MOD_INTRO:               return true;
        case FEATURE_COMPLETION_TRACKS_VIEWS: return true;
        case FEATURE_GRADE_HAS_GRADE:         return true;
        //case FEATURE_GRADE_OUTCOMES:          return true;
        case FEATURE_BACKUP_MOODLE2:          return true;
        case FEATURE_SHOW_DESCRIPTION:        return true;

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

    $DB->execute("DELETE FROM {recit360tours_pages_views} WHERE id IN (SELECT rapageid FROM {recit360tours_pages} WHERE raid=$id)");
    $DB->delete_records('recit360tours', array('id'=>$recit360tours->id));
    $DB->delete_records('recit360tours_pages', array('raid'=>$recit360tours->id));

    return true;
}


/**
 * Update grades in central gradebook
 *
 * @category grade
 * @param object $lesson
 * @param int $userid specific user only, 0 means all
 * @param bool $nullifnone
 */
function recit360tours_update_grades($lesson, $userid, $nullifnone=true) {
    global $CFG, $DB, $USER;    

    if ($grades = PersistCtrl::getInstance($DB, $USER)->getUsersGrades($lesson->instance, $userid)) {
        recit360tours_grade_item_update($lesson, $grades);

    } else if ($userid and $nullifnone) {
        $grade = new stdClass();
        $grade->userid   = $userid;
        $grade->rawgrade = null;
        recit360tours_grade_item_update($lesson, $grade);

    } else {
        recit360tours_grade_item_update($lesson);
    }
}

/**
 * Create grade item for given lesson
 *
 * @category grade
 * @uses GRADE_TYPE_VALUE
 * @uses GRADE_TYPE_NONE
 * @param object $lesson object with extra cmidnumber
 * @param array|object $grades optional array/object of grade(s); 'reset' means reset grades in gradebook
 * @return int 0 if ok, error code otherwise
 */
function recit360tours_grade_item_update($lesson, $grades=null) {
    global $CFG;
    if (!function_exists('grade_update')) { //workaround for buggy PHP versions
        require_once($CFG->libdir.'/gradelib.php');
    }

    if (property_exists($lesson, 'cmidnumber')) { //it may not be always present
        $params = array('itemname'=>$lesson->name, 'idnumber'=>$lesson->cmidnumber);
    } else {
        $params = array('itemname'=>$lesson->name);
    }

    if (is_numeric($lesson->grade) && $lesson->grade > 0) {
        $params['gradetype']  = GRADE_TYPE_VALUE;
        $params['grademax']   = $lesson->grade;
        $params['grademin']   = 0;
    } else {
        $params['gradetype']  = GRADE_TYPE_NONE;
    }

    if ($grades  === 'reset') {
        $params['reset'] = true;
        $grades = null;
    } else if (!empty($grades) && is_numeric($lesson->grade)) {
        // Need to calculate raw grade (Note: $grades has many forms)
        $gradesToSend = array();
        if (is_object($grades)) {
            $grades = array($grades->userid => $grades);
        } else if (array_key_exists('userid', $grades)) {
            $grades = array($grades['userid'] => $grades);
        }
        foreach ($grades as $key => $grade) {
            if (!is_array($grade)) {
                $grades[$key] = $grade = (array) $grade;
            }
            //check raw grade isnt null otherwise we erroneously insert a grade of 0
            if ($grade['grade'] !== null) {
                $gradesToSend[$grade['userid']] = array('rawgrade' => $grade['grade'], 'userid' => $grade['userid']);
            } else {
                //setting rawgrade to null just in case user is deleting a grade
                $gradesToSend[$grade['userid']] = array('rawgrade' => null, 'userid' => $grade['userid']);
            }
        }
    }

    grade_update('mod/recit360tours', $lesson->course, 'mod', 'recit360tours', $lesson->id, 0, $gradesToSend, $params);
}

function recit360tours_attempt_callback($e){
    global $DB;
    $cm = get_coursemodule_from_id('recit360tours', $e->get_context()->instanceid, $e->courseid);
    if (!$cm) return;
    $cmdata = $DB->get_record('recit360tours', array('id'=>$cm->instance));
    $cmdata->instance = $cm->instance;
    recit360tours_update_grades($cmdata, $e->userid);
}

function recit360tours_reset_userdata($data) {
    global $DB, $USER;
    if (!empty($data->reset_userdata)) {
        $recitact = $DB->get_records('recit360tours', array('course'=>$data->courseid));
        foreach ($recitact as $v){
            $id = $v->id;
            $DB->execute("DELETE FROM {recit360tours_pages_views} WHERE id IN (SELECT rapageid FROM {recit360tours_pages} WHERE raid=$id)");
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
    $mform->addElement('header', 'recitcahiertracesheader', get_string('modulenameplural', 'recit360tours'));

    $mform->addElement('checkbox', 'reset_userdata', get_string('reset'));

}

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