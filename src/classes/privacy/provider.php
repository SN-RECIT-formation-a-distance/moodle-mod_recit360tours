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

namespace mod_recit360tours\privacy;

defined('MOODLE_INTERNAL') || die();

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;

/**
 * Privacy provider for mod_recit360tours.
 *
 * Personal data stored:
 *   - recit360tours_views  : userid, objectid, timeviewed  (student activity tracking)
 *   - recit360tours_scenes : creatorid                      (authorship)
 */
class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\plugin\provider,
    \core_privacy\local\request\core_userlist_provider {

    public static function get_metadata(collection $collection): collection {
        $collection->add_database_table(
            'recit360tours_views',
            [
                'userid'     => 'privacy:metadata:recit360tours_views:userid',
                'objectid'   => 'privacy:metadata:recit360tours_views:objectid',
                'timeviewed' => 'privacy:metadata:recit360tours_views:timeviewed',
            ],
            'privacy:metadata:recit360tours_views'
        );

        $collection->add_database_table(
            'recit360tours_scenes',
            [
                'creatorid' => 'privacy:metadata:recit360tours_scenes:creatorid',
            ],
            'privacy:metadata:recit360tours_scenes'
        );

        return $collection;
    }

    public static function get_contexts_for_userid(int $userid): contextlist {
        $contextlist = new contextlist();

        // Contexts where the user has viewed objects.
        $sql = "SELECT ctx.id
                  FROM {context} ctx
                  JOIN {course_modules} cm ON cm.id = ctx.instanceid
                                          AND ctx.contextlevel = :ctxlevel
                  JOIN {modules} m         ON m.id = cm.module AND m.name = 'recit360tours'
                  JOIN {recit360tours_scenes} s  ON s.tourid = cm.instance
                  JOIN {recit360tours_objects} o ON o.sceneid = s.id
                  JOIN {recit360tours_views} v   ON v.objectid = o.id
                 WHERE v.userid = :userid";
        $contextlist->add_from_sql($sql, ['userid' => $userid, 'ctxlevel' => CONTEXT_MODULE]);

        // Contexts where the user has created scenes.
        $sql = "SELECT ctx.id
                  FROM {context} ctx
                  JOIN {course_modules} cm ON cm.id = ctx.instanceid
                                          AND ctx.contextlevel = :ctxlevel
                  JOIN {modules} m         ON m.id = cm.module AND m.name = 'recit360tours'
                  JOIN {recit360tours_scenes} s ON s.tourid = cm.instance
                 WHERE s.creatorid = :userid";
        $contextlist->add_from_sql($sql, ['userid' => $userid, 'ctxlevel' => CONTEXT_MODULE]);

        return $contextlist;
    }

    public static function get_users_in_context(userlist $userlist): void {
        $context = $userlist->get_context();
        if (!$context instanceof \context_module) {
            return;
        }
        $cm = get_coursemodule_from_id('recit360tours', $context->instanceid);
        if (!$cm) {
            return;
        }

        $sql = "SELECT DISTINCT v.userid
                  FROM {recit360tours_views} v
                  JOIN {recit360tours_objects} o ON o.id = v.objectid
                  JOIN {recit360tours_scenes} s  ON s.id = o.sceneid
                 WHERE s.tourid = :tourid";
        $userlist->add_from_sql('userid', $sql, ['tourid' => $cm->instance]);

        $sql = "SELECT DISTINCT s.creatorid AS userid
                  FROM {recit360tours_scenes} s
                 WHERE s.tourid = :tourid";
        $userlist->add_from_sql('userid', $sql, ['tourid' => $cm->instance]);
    }

    public static function export_user_data(approved_contextlist $contextlist): void {
        global $DB;

        if (empty($contextlist->count())) {
            return;
        }

        $user = $contextlist->get_user();

        foreach ($contextlist->get_contexts() as $context) {
            if (!$context instanceof \context_module) {
                continue;
            }
            $cm = get_coursemodule_from_id('recit360tours', $context->instanceid);
            if (!$cm) {
                continue;
            }

            $sql = "SELECT v.objectid, v.timeviewed, o.type
                      FROM {recit360tours_views} v
                      JOIN {recit360tours_objects} o ON o.id = v.objectid
                      JOIN {recit360tours_scenes} s  ON s.id = o.sceneid
                     WHERE s.tourid = ? AND v.userid = ?
                  ORDER BY v.timeviewed";
            $views = $DB->get_records_sql($sql, [$cm->instance, $user->id]);

            if (!empty($views)) {
                $data = (object)[
                    'views' => array_values(array_map(function($v) {
                        return (object)[
                            'objectid'   => $v->objectid,
                            'objecttype' => $v->type,
                            'timeviewed' => \core_privacy\local\request\transform::datetime($v->timeviewed),
                        ];
                    }, $views)),
                ];
                writer::with_context($context)->export_data(
                    [get_string('pluginname', 'recit360tours')],
                    $data
                );
            }
        }
    }

    public static function delete_data_for_all_users_in_context(\context $context): void {
        global $DB;

        if (!$context instanceof \context_module) {
            return;
        }
        $cm = get_coursemodule_from_id('recit360tours', $context->instanceid);
        if (!$cm) {
            return;
        }

        $DB->execute(
            "DELETE FROM {recit360tours_views}
              WHERE objectid IN (
                  SELECT o.id FROM {recit360tours_objects} o
                  JOIN {recit360tours_scenes} s ON s.id = o.sceneid
                  WHERE s.tourid = ?
              )",
            [$cm->instance]
        );
    }

    public static function delete_data_for_user(approved_contextlist $contextlist): void {
        global $DB;

        if (empty($contextlist->count())) {
            return;
        }

        $user = $contextlist->get_user();

        foreach ($contextlist->get_contexts() as $context) {
            if (!$context instanceof \context_module) {
                continue;
            }
            $cm = get_coursemodule_from_id('recit360tours', $context->instanceid);
            if (!$cm) {
                continue;
            }

            $DB->execute(
                "DELETE FROM {recit360tours_views}
                  WHERE userid = ? AND objectid IN (
                      SELECT o.id FROM {recit360tours_objects} o
                      JOIN {recit360tours_scenes} s ON s.id = o.sceneid
                      WHERE s.tourid = ?
                  )",
                [$user->id, $cm->instance]
            );
        }
    }

    public static function delete_data_for_users(approved_userlist $userlist): void {
        global $DB;

        $context = $userlist->get_context();
        if (!$context instanceof \context_module) {
            return;
        }
        $cm = get_coursemodule_from_id('recit360tours', $context->instanceid);
        if (!$cm) {
            return;
        }

        $userids = $userlist->get_userids();
        if (empty($userids)) {
            return;
        }

        list($insql, $inparams) = $DB->get_in_or_equal($userids, SQL_PARAMS_NAMED);

        $DB->execute(
            "DELETE FROM {recit360tours_views}
              WHERE userid $insql AND objectid IN (
                  SELECT o.id FROM {recit360tours_objects} o
                  JOIN {recit360tours_scenes} s ON s.id = o.sceneid
                  WHERE s.tourid = :tourid
              )",
            array_merge($inparams, ['tourid' => $cm->instance])
        );
    }
}
