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

if (!defined('MOODLE_INTERNAL')) {
    die('Direct access to this script is forbidden.');    ///  It must be included from a Moodle page
}

require_once ($CFG->dirroot.'/course/moodleform_mod.php');

class mod_recit360tours_mod_form extends moodleform_mod {
    public function definition() {
        //$config = get_config('url');
        $this->displayGeneralOptions();      
        //$this->displaySectionActivities();
        $this->standard_coursemodule_elements();
        $this->add_action_buttons();
    }

    public function displayGeneralOptions(){
        global $CFG;
        $mform = $this->_form;
        $mform->addElement('header', 'general', get_string('general', 'form'));
        $mform->addElement('text', 'name', get_string('name'), array('size'=>'48'));
        if (!empty($CFG->formatstringstriptags)) {
            $mform->setType('name', PARAM_TEXT);
        } else {
            $mform->setType('name', PARAM_CLEANHTML);
        }
        $mform->addRule('name', null, 'required', null, 'client');
        $mform->addRule('name', get_string('maximumchars', '', 255), 'maxlength', 255, 'client');
        $this->standard_intro_elements();
        $element = $mform->getElement('introeditor');
        $attributes = $element->getAttributes();
        $attributes['rows'] = 5;
        $element->setAttributes($attributes);
    }

    /**
     * Add elements for setting the custom completion rules.
     *
     * @return array List of added element names, or names of wrapping group elements.
     * @category completion
     */
    public function add_completion_rules(): array {
        $mform = $this->_form;

        // Elements for completion by Attendance.
        $attendance['grouplabel'] = get_string('completionobjects', 'recit360tours');
        $attendance['rulelabel'] = get_string('completionobjects_desc', 'recit360tours');
        $attendance['group'] = [
            $mform->createElement('advcheckbox', 'completionobjects', '', $attendance['rulelabel'] . '&nbsp;')
        ];
        $mform->addGroup($attendance['group'], 'completionobjectsgroup', $attendance['grouplabel'], [' '], false);

        return ['completionobjectsgroup'];
    }

    /**
     * Called during validation to see whether some module-specific completion rules are selected.
     *
     * @param array $data Input data not yet validated.
     * @return bool True if one or more rules is enabled, false if none are.
     */
    public function completion_rule_enabled($data) {
        return !empty($data['completionobjects']);
    }

    function data_preprocessing(&$default_values){
    
        // Set up the completion checkboxes which aren't part of standard data.
        // We also make the default value (if you turn on the checkbox) for those
        // numbers to be 1, this will not apply unless checkbox is ticked.
        $default_values['completionobjects']= !empty($default_values['completionobjects']) ? 1 : 0;
    }

    function get_data() {
        $data = parent::get_data();
        if (!$data) {
            return $data;
        }
        if (!empty($data->completionunlocked)) {
            // Turn off completion settings if the checkboxes aren't ticked
            $autocompletion = !empty($data->completion) && $data->completion==COMPLETION_TRACKING_AUTOMATIC;
            $data->completionobjects = !empty($data->completionobjects) ? 1 : 0;
            if (empty($data->completionpostsenabled) || !$autocompletion) {
               //$data->completionobjects = 0;
            }
        }
        return $data;
    }
}
