import { eq, sql } from 'drizzle-orm';
import { groups } from './schema/group';
import { usersToGroups } from './schema/userToGroup';
import { users } from './schema/user';
import { db } from './db';
import { classes } from './schema/class';
import { classesToStudents } from './schema/classToStudents';

export const PLeader = db
  .select({ leader: groups.leader })
  .from(groups)
  .where(eq(groups.id, sql.placeholder('groupId')))
  .prepare();

export const PRawMembers = db
  .select({ userId: usersToGroups.userId })
  .from(usersToGroups)
  .where(eq(usersToGroups.groupId, sql.placeholder('id')))
  .prepare();

export const PMemberUsername = db
  .select({ id: users.id, username: users.username })
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare();

export const PClassContent = db
  .select()
  .from(classes)
  .where(eq(classes.id, sql.placeholder('id')))
  .prepare();

export const PGroupIds = db
  .select({ groupId: usersToGroups.groupId })
  .from(usersToGroups)
  .where(eq(usersToGroups.userId, sql.placeholder('id')))
  .prepare();

export const PClassId = db
  .select({ classId: classesToStudents.classId })
  .from(classesToStudents)
  .where(eq(classesToStudents.userId, sql.placeholder('id')))
  .prepare();

export const PGetBasicUser = db
  .select()
  .from(users)
  .where(eq(users.id, sql.placeholder('id')))
  .prepare();

export const PGetStudents = db
  .select({ userId: classesToStudents.userId })
  .from(classesToStudents)
  .where(eq(classesToStudents.classId, sql.placeholder('id')))
  .prepare();
