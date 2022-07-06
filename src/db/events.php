<?php
$observers = array(
    array(
        'eventname'   => 'mod_quiz\event\attempt_submitted',
        'callback'    => 'recit360tours_attempt_callback',
    ),
);

