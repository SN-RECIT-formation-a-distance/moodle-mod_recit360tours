<?php

defined('MOODLE_INTERNAL') || die();

function xmldb_mod_recit360tours_uninstall() {
    // Moodle uses the file install.xml to drop all the tables related to this plugin
    return true;
}
