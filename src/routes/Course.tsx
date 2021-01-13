import React, { useContext, useState, useEffect } from 'react';
import { Empty } from 'antd';
import Context from '../context';
import { Title } from '../components/Typography';
import { LinkButton } from '../components/button';
import Icons from '../assets/icons';
import { ParsedCourseOverview } from '../types/Course';
import MyCourseCard from '../components/cards/MyCourseCard';

import classes from './Course.module.scss';
import { parseCourse } from '../utils/CourseUtil';
import { UserContext } from '../context/UserContext';
import { CourseBanner } from '../components/course/CourseBanner';
import { env } from '../api/config';
import { NoCourses } from '../components/NoService';

const Course = () => {
  const [loading, setLoading] = useState(false);
  const [myCourses, setMyCourses] = useState<ParsedCourseOverview[]>([]);
  const apiContext = useContext(Context.Api);
  const userContext = useContext(UserContext);

  const courseOverviewDisabled = env.REACT_APP_COURSE_OVERVIEW === 'disabled';

  useEffect(() => {
    if (courseOverviewDisabled) return;

    setLoading(true);

    apiContext
      .getMyCourses(userContext.user.type)
      .then((c) => {
        setMyCourses(c.map(parseCourse));
      })
      .catch(() => {
        // message.error('Kurse konnten nicht geladen werden.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiContext, userContext.user.type]);

  if (courseOverviewDisabled) {
    return <NoCourses />;
  }

  if (loading) {
    return <div>Kurse werden geladen...</div>;
  }

  return (
    <div className={classes.container}>
      <CourseBanner
        targetGroup={
          userContext.user.type === 'student' ? 'instructors' : 'participants'
        }
      />
      <div className={classes.containerRequests}>
        <div className={classes.header}>
          <Title size="h1">Deine Kurse</Title>
          {userContext.user.type === 'student' && (
            <LinkButton
              href="/courses/create"
              local
              backgroundColor="#F4486D"
              color="white"
              className={classes.courseButton}
            >
              <Icons.Add height="16px" />
              Erstelle einen Kurs
            </LinkButton>
          )}
        </div>
        <div className={classes.myCoursesContainer}>
          {myCourses.length === 0 ? (
            <Empty description="Du hast im Moment keine Kurse" />
          ) : (
            myCourses.map((c) => {
              return <MyCourseCard course={c} ownedByMe showCourseState />;
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
