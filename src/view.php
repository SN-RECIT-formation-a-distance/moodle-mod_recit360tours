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
 * @copyright 2020 RÉCIT FAD
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace recit360tours;

use moodle_url;

require('../../config.php');

$id = required_param('id', PARAM_INT);
list ($course, $cm) = get_course_and_cm_from_cmid($id, 'recit360tours');

require_login();

$view = new MainView($PAGE, $course, $cm, $OUTPUT, $USER, $DB, $CFG);

$view->display();

class MainView
{
    protected $viewMode = null;
    protected $data = null;

    protected $page = null;
    protected $course = null;
    protected $cm = null;
    protected $output = null;
    protected $user = null;
    protected $db = null;
    protected $cfg = null;

    public function __construct($page, $course, $cm, $output, $user, $db, $cfg){
        $this->page = $page;
        $this->course = $course;
        $this->cm = $cm;
        $this->output = $output;
        $this->user = $user;
        $this->db = $db;
        $this->cfg = $cfg;
    }

    public function display(){
        $this->page->set_cm($this->cm);
        $this->page->set_url('/mod/recit360tours/view.php', array('id' => $this->cm->id));
        $this->page->set_pagelayout('incourse');
        $this->page->set_title($this->course->shortname.': '.$this->cm->name);
        $this->page->set_heading($this->course->fullname);

        $this->page->requires->css(new moodle_url('./react/build/index.css'), true);
        $this->page->requires->js(new moodle_url('./react/build/index.js?v=a'.rand(700,900)), true);

        echo $this->output->header();

        echo sprintf("<div id='mod_recit360tours' data-tour-id='%ld'></div>", $this->cm->instance);

        echo $this->output->footer();
    }
}
