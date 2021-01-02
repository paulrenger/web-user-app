import React from 'react';
import moment from 'moment';
import { Text, Title } from '../Typography';
import { ParsedCourseOverview } from '../../types/Course';

import classes from './CourseCard.module.scss';

interface Props {
  course: ParsedCourseOverview;
}

const CourseCard: React.FC<Props> = ({ course }) => {
  return (
    <div className={classes.baseContainer}>
      <div className={classes.highlight} />
      <Title size="h4" bold>
        {course.name}
      </Title>
      <Text large>{course.description}</Text>
      <div className={classes.info}>
        <Text large>
          ab {moment(course.subcourse?.lectures[0].start).format('DD.MM.')}
        </Text>
        <Text large>{course.subcourse?.lectures.length} Termine</Text>
        <Text large>
          {course.subcourse?.minGrade}. - {course.subcourse?.maxGrade}. Klasse
        </Text>
        <Text large>
          {course.subcourse?.participants} / {course.subcourse?.maxParticipants}
        </Text>
      </div>
    </div>
  );
};

export default CourseCard;
