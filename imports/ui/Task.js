import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';

import { Tasks } from '../api/tasks.js';
import { Button, Badge, Checkbox } from '@material-ui/core'
import {Cancel, ThumbUp, ThumbDown} from '@material-ui/icons'
import { makeStyles, useTheme } from '@material-ui/core/styles';
// Task component - represents a single todo item
export default class Task extends Component {

  toggleChecked() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
  }

  deleteThisTask() {
    Meteor.call('tasks.remove', this.props.task._id);
  }

  togglePrivate() {
    Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
  }

  upvoteMovie() {
    Meteor.call('tasks.upvoteMovie', this.props.task._id);
  }

  downvoteMovie () {
    Meteor.call('tasks.downvoteMovie', this.props.task._id);
  }

  render() {
    // Give tasks a different className when they are checked off,
    // so that we can style them nicely in CSS
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
    });

    return (
      <li className={taskClassName}>
        <Button className="delete" onClick={this.deleteThisTask.bind(this)}>
          <Cancel/>
        </Button>

        <Checkbox checked={!!this.props.task.checked} onClick={this.toggleChecked.bind(this)}/>
        <Badge badgeContent={this.props.task.votes} color={this.props.task.votes > -1 ? "primary" : "error"} showZero/>
        <Button onClick={this.upvoteMovie.bind(this)} color='primary'>
          <ThumbUp />
        </Button>
        <Button onClick={this.downvoteMovie.bind(this)} color='secondary'>
          <ThumbDown />
        </Button>

        <span className="text">
          <strong>{this.props.task.username}</strong>: {this.props.task.text}
        </span>
      </li>
    );
  }
}
