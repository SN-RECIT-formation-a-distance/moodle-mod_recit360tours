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
 * @package    mod_recit360tours
 * @subpackage backup-moodle2
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Define all the restore steps that will be used by the restore_recit360tours_activity_task
 */

/**
 * Structure step to restore one recit360tours activity
 */
class restore_recit360tours_activity_structure_step extends restore_activity_structure_step {
    protected function define_structure() {

        $userinfo = $this->get_setting_value('userinfo');
        
        $paths = array();
        $paths[] = new restore_path_element('recit360tours', '/activity/recit360tours');
        $paths[] = new restore_path_element('recit360tours_scenes', '/activity/recit360tours/recit360tours_scenes');
        $paths[] = new restore_path_element('recit360tours_objects', '/activity/recit360tours/recit360tours_scenes/recit360tours_objects');
        if ($userinfo){
            $paths[] = new restore_path_element('recit360tours_views', '/activity/recit360tours/recit360tours_scenes/recit360tours_objects/recit360tours_views');
        }

        // Return the paths wrapped into standard activity structure
        return $this->prepare_activity_structure($paths);
    }

    protected function process_recit360tours($data) {
        global $DB, $USER;

        $data = (object)$data;
        $oldId = $data->id;
        $data->course = $this->get_courseid();

        // Any changes to the list of dates that needs to be rolled should be same during course restore and course reset.
        // See MDL-9367.

        // insert the recit360tours record
        $newitemid = $DB->insert_record('recit360tours', $data);     
        
        // immediately after inserting "activity" record, call this
        $this->apply_activity_instance($newitemid);
        $this->set_mapping('recit360tours', $oldId, $newitemid, true); // Has related files.
    }

    protected function process_recit360tours_scenes($data) {
        global $DB, $USER;

        $data = (object)$data;
        $oldid = $data->id;
        
        $data->tourid = $this->get_mappingid('recit360tours', $data->tourid);
        $newitemid = $DB->insert_record('recit360tours_scenes', $data); // insert the recit360tours_notes record
        $this->set_mapping('recit360tours_scenes', $oldid, $newitemid, true); 
    }

    protected function process_recit360tours_objects($data) {
        global $DB, $USER;

        $data = (object)$data;
        $oldid = $data->id;
        
        $data->sceneid = $this->get_mappingid('recit360tours_scenes', $data->sceneid);

        $newitemid = $DB->insert_record('recit360tours_objects', $data);
        $this->set_mapping('recit360tours_objects', $oldid, $newitemid, true);        
    }
    
    protected function process_recit360tours_views($data) {
        global $DB;
 
        $data = (object)$data;
        $data->objectid = $this->get_mappingid('recit360tours_objects', $data->objectid);
        $data->userid = $this->get_mappingid('user', $data->userid);

        $newitemid = $DB->insert_record('recit360tours_views', $data);
    }

    protected function after_execute() {
        // Add recit360tours related files, no need to match by itemname (just internally handled context)
        $this->add_related_files('mod_recit360tours', 'intro', null);
        $this->add_related_files('mod_recit360tours', 'resources', null);
    }
}

