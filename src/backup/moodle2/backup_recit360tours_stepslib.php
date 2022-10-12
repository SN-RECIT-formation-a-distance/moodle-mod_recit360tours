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
 * Define all the backup steps that will be used by the backup_recit360tours_activity_task
 *
 * @package    mod_recit360tours
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

 /**
 * Define the complete recit360tours structure for backup, with file and id annotations
 */
class backup_recit360tours_activity_structure_step extends backup_activity_structure_step {

    protected function define_structure() {
        global $DB, $USER;

        // To know if we are including userinfo
        $userinfo = $this->get_setting_value('userinfo');

        // Define each element separated
        $recit360tours = new backup_nested_element('recit360tours', array('id'), array(
            'course', 'name', 'intro', 'introformat', 'display', 'timemodified', 'completionobjects'));

        $recit360tours_scenes = new backup_nested_element('recit360tours_scenes', array('id'), array('tourid', 'name', 'image', 'timemodified', 'creatorid', 'startscene'));

        $recit360tours_objects = new backup_nested_element('recit360tours_objects', array('id'), array(
            'sceneid', 'type', 'object', 'completion'));

       $recit360tours_views = new backup_nested_element('recit360tours_views', array('id'), array('objectid', 'userid', 'timeviewed'));

        // Build the tree
       $recit360tours_scenes->add_child($recit360tours_objects);
       $recit360tours_objects->add_child($recit360tours_views);
       $recit360tours->add_child($recit360tours_scenes);

        // Define sources
        $recit360tours->set_source_table('recit360tours', array('id' => backup::VAR_ACTIVITYID));
        $recit360tours_scenes->set_source_table('recit360tours_scenes', array('tourid' => backup::VAR_PARENTID));
        $recit360tours_objects->set_source_table('recit360tours_objects', array('sceneid' => backup::VAR_PARENTID));

        if ($userinfo){
            $recit360tours_views->set_source_table('recit360tours_views', array('objectid' => backup::VAR_PARENTID));
        }

        // Define id annotations
        //$recit360tours->annotate_ids('question', 'questionid');
        $recit360tours_views->annotate_ids('user', 'userid');
        
        // Define file annotations
        $recit360tours->annotate_files('mod_recit360tours', 'intro', null);
        $recit360tours->annotate_files('mod_recit360tours', 'resources', null);

        // Return the root element (recit360tours), wrapped into standard activity structure
        return $this->prepare_activity_structure($recit360tours);

    }
}
