import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import {indexOf, remove} from 'lodash'

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });
}

Meteor.methods({
  'tasks.insert'(text) {
    check(text, String);

    // Make sure the user is logged in before inserting a task
    if (! this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (text.match("The Notebook")) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username,
      votes: 0,
      upvotedBy: [],
      downvotedBy: [],
      listWeight: 10
    });
  },
  'tasks.remove'(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error('not-authorized');
    }

    Tasks.remove(taskId);
  },
  'tasks.setChecked'(taskId, setChecked) {
    check(taskId, String);
    check(setChecked, Boolean);

    const task = Tasks.findOne(taskId);
    if (task.private && task.owner !== this.userId) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { checked: setChecked, listWeight: -10 } });
  },
  'tasks.setPrivate'(taskId, setToPrivate) {
    check(taskId, String);
    check(setToPrivate, Boolean);

    const task = Tasks.findOne(taskId);

    // Make sure only the task owner can make a task private
    if (task.owner !== this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.update(taskId, { $set: { private: setToPrivate } });
  },
  'tasks.upvoteMovie'(taskId) {
    check(taskId, String);

    const task = Tasks.findOne(taskId);
    console.log(task);
    if (task.checked) {
      return;
    }
    if(indexOf(task.upvotedBy, this.userId) > -1){
      return;
    }
    if(indexOf(task.downvotedBy, this.userId) > -1){
      remove(task.downvotedBy, userId => {
        return userId === this.userId
      })
    }
    const votes = task.votes + 1;
    task.upvotedBy.push(this.userId)

    Tasks.update(taskId, { $set: { votes, upvotedBy: task.upvotedBy, downvotedBy: task.downvotedBy } });
    
  },
  'tasks.downvoteMovie'(taskId){
    check(taskId, String);

    const task = Tasks.findOne(taskId);

    if (task.checked) {
      return;
    }
    if(indexOf(task.downvotedBy, this.userId) > -1){
      return;
    }
    if(indexOf(task.upvotedBy, this.userId) > -1){
      remove(task.upvotedBy, userId => {
        return userId === this.userId
      })
    }

    const votes = task.votes - 1;

    task.downvotedBy.push(this.userId)

    Tasks.update(taskId, { $set: { votes, upvotedBy: task.upvotedBy, downvotedBy: task.downvotedBy } });

  }
});
