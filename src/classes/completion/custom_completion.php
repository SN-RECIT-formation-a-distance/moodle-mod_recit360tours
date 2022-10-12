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

namespace mod_recit360tours\completion;

use core_completion\activity_custom_completion;
use moodle_exception;
use stdClass;
require_once dirname(__FILE__) . "/../PersistCtrl.php";

/**
 * Class custom_completion
 *
 */
class custom_completion extends activity_custom_completion {

    /**
     * Get current state
     *
     * @param string $rule
     * @return int
     */
    public function get_state(string $rule): int {
        global $DB, $USER, $CFG;
        $ctrl = \recit360tours\PersistCtrl::getInstance($DB, $USER); 

        // Default return value.
        $value = COMPLETION_INCOMPLETE;

        if ($ctrl->isTourCompleted($this->cm->instance, $USER->id)) {
            $value = COMPLETION_COMPLETE;
        }
        return $value;
    }

    /**
     * Fetch the list of custom completion rules that this module defines.
     *
     * @return array
     */
    public static function get_defined_custom_rules(): array {
        return [
            'completionobjects',
        ];
    }

    /**
     * Returns an associative array of the descriptions of custom completion rules.
     *
     * @return array
     */
    public function get_custom_rule_descriptions(): array {
        $completionobjects = $this->cm->customdata['customcompletionrules']['completionobjects'] ?? 1;
        return [
            'completionobjects' => get_string('completionobjects_desc', 'mod_recit360tours',
                $completionobjects),
        ];
    }

    /**
     * Returns an array of all completion rules, in the order they should be displayed to users.
     *
     * @return array
     */
    public function get_sort_order(): array {
        return [
            'completionobjects',
        ];
    }
}