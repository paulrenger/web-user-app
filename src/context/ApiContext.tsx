import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { User, Subject } from '../types';
import * as api from '../api/api';
import { AxiosResponse } from 'axios';
import { CertificateData } from '../components/Modals/CerificateModal';
import { Tutee, Tutor } from '../types/Registration';
import { Course, SubCourse, Lecture, CourseOverview } from '../types/Course';
import { UserContext } from './UserContext';

interface IApiContext {
  getUserData: () => Promise<any>;
  dissolveMatch: (uuid: string, reason?: number) => Promise<void>;
  requestNewToken: (email: string) => Promise<void>;
  putUserSubjects: (subjects: Subject[]) => Promise<void>;
  becomeInstructor: (description: string) => Promise<void>;
  putUserActiveFalse: () => Promise<void>;
  getCertificate: (
    cerfiticateData: CertificateData
  ) => Promise<AxiosResponse<any>>;
  getCourses: () => Promise<CourseOverview[]>;
  getCourse: (id: string) => Promise<CourseOverview>;
  getMyCourses: (type: 'student' | 'pupil') => Promise<CourseOverview[]>;
  createCourse: (coure: Course) => Promise<number>;
  cancelCourse: (courseId: number) => Promise<void>;
  editCourse: (id: number, course: Course) => Promise<void>;
  joinCourse: (
    courseId: number,
    subCourseId: number,
    participantId: string
  ) => Promise<void>;
  leaveCourse: (
    courseId: number,
    subCourseId: number,
    participantId: string
  ) => Promise<void>;
  submitCourse: (id: number, course: Course) => Promise<void>;
  publishSubCourse: (
    courseId: number,
    id: number,
    subcourse: SubCourse
  ) => Promise<void>;
  createSubCourse: (courseId: number, subCoure: SubCourse) => Promise<number>;
  cancelSubCourse: (courseId: number, subCoureId: number) => Promise<void>;
  createLecture: (
    courseId: number,
    subCourseId: number,
    lecture: Lecture
  ) => Promise<number>;
  cancelLecture: (
    courseId: number,
    subCourseId: number,
    lectureId: number
  ) => Promise<void>;
  registerTutee: (tutee: Tutee) => Promise<any>;
  registerTutor: (tutor: Tutor) => Promise<any>;
  sendCourseGroupMail: (
    courseId: number,
    subCourseId: number,
    subject: string,
    body: string
  ) => Promise<void>;
}

export const ApiContext = React.createContext<IApiContext>({
  getUserData: () => Promise.reject(),
  dissolveMatch: (uuid, reason?) => Promise.reject(),
  requestNewToken: api.axiosRequestNewToken,
  putUserSubjects: (subjects) => Promise.reject(),
  becomeInstructor: (description: string) => Promise.reject(),
  putUserActiveFalse: () => Promise.reject(),
  getCertificate: (cerfiticateData) => Promise.reject(),
  getCourses: () => Promise.reject(),
  getCourse: (courseId) => Promise.reject(),
  getMyCourses: () => Promise.reject(),
  createCourse: (course) => Promise.reject(),
  cancelCourse: (id) => Promise.reject(),
  editCourse: (id, course) => Promise.reject(),
  joinCourse: (courseId: number, subCourseId: number, participantId: string) =>
    Promise.reject(),
  leaveCourse: (courseId: number, subCourseId: number, participantId: string) =>
    Promise.reject(),
  submitCourse: (id, course) => Promise.reject(),
  publishSubCourse: (courseId, id, course) => Promise.reject(),
  createSubCourse: (id, subCourse) => Promise.reject(),
  cancelSubCourse: (id, subCourseId) => Promise.reject(),
  createLecture: (id, subCourseId, lecture) => Promise.reject(),
  cancelLecture: (id, subCourseId, lectureId) => Promise.reject(),
  registerTutee: (tutee) => Promise.reject(),
  registerTutor: (tutor) => Promise.reject(),
  sendCourseGroupMail: (id, subCourseId, subject, body) => Promise.reject(),
});

export const ApiProvider: React.FC = ({ children }) => {
  const authContext = useContext(AuthContext);

  const {
    credentials: { id, token },
  } = authContext;

  const getUserData = (): Promise<User> => api.axiosGetUser(id, token);

  const dissolveMatch = (uuid: string, reason?: number): Promise<void> =>
    api.axiosDissolveMatch(id, token, uuid, reason);

  const putUserSubjects = (subjects: Subject[]): Promise<void> =>
    api.axiosPutUserSubjects(id, token, subjects);

  const becomeInstructor = (description: string): Promise<void> =>
    api.axiosBecomeInstructor(token, description);

  const putUserActiveFalse = (): Promise<void> =>
    api.axiosPutUserActive(id, token, false);

  const getCertificate = (
    certificateDate: CertificateData
  ): Promise<AxiosResponse<any>> =>
    api.axiosGetCertificate(id, token, certificateDate);

  const getCourses = (): Promise<CourseOverview[]> =>
    api.axiosGetCourses(token);

  const getCourse = (id: string): Promise<CourseOverview> =>
    api.axiosGetCourse(token, id);

  const getMyCourses = (
    type: 'student' | 'pupil'
  ): Promise<CourseOverview[]> => {
    if (type === 'student') {
      return api.axiosGetMyCourses(token, id);
    }

    return api.axiosGetMyCourses(token, undefined, id);
  };

  const createCourse = (course: Course): Promise<number> =>
    api.axiosCreateCourse(token, {
      ...course,
      instructors: [...course.instructors, id],
    });

  const cancelCourse = (courseId: number): Promise<void> =>
    api.axiosCancelCourse(token, courseId);

  const createSubCourse = (
    courseId: number,
    subCourse: SubCourse
  ): Promise<number> =>
    api.axiosCreateSubCourse(token, courseId, {
      ...subCourse,
      instructors: [...subCourse.instructors, id],
    });

  const cancelSubCourse = (
    courseId: number,
    subCourseId: number
  ): Promise<void> => api.axiosCancelSubCourse(token, courseId, subCourseId);

  const createLecture = (
    courseId: number,
    subCourseId: number,
    lecture: Lecture
  ): Promise<number> =>
    api.axiosCreateLecture(token, courseId, subCourseId, {
      ...lecture,
      instructor: lecture.instructor.length === 0 ? id : lecture.instructor,
    });

  const cancelLecture = (
    courseId: number,
    subCourseId: number,
    lectureId: number
  ): Promise<void> =>
    api.axiosCancelLecture(token, courseId, subCourseId, lectureId);

  const registerTutee = (tutee: Tutee): Promise<void> =>
    api.axiosRegisterTutee(tutee);

  const registerTutor = (tutor: Tutor): Promise<void> =>
    api.axiosRegisterTutor(tutor);

  const editCourse = (id: number, course: Course) =>
    api.axiosEditCourse(token, id, course);

  const joinCourse = (courseId: number, subCourseId, participantId: string) =>
    api.axiosJoinCourse(token, courseId, subCourseId, participantId);

  const leaveCourse = (courseId: number, subCourseId, participantId: string) =>
    api.axiosLeaveCourse(token, courseId, subCourseId, participantId);

  const submitCourse = (id: number, course: Course) =>
    api.axiosSubmitCourse(token, id, course);

  const publishSubCourse = (
    courseId: number,
    id: number,
    subcourse: SubCourse
  ) => api.axiosPublishSubCourse(token, courseId, id, subcourse);

  const sendCourseGroupMail = (
    courseId: number,
    subCourseId: number,
    subject: string,
    body: string
  ) =>
    api.axiosSendCourseGroupMail(token, courseId, subCourseId, subject, body);

  return (
    <ApiContext.Provider
      value={{
        getUserData,
        dissolveMatch,
        requestNewToken: api.axiosRequestNewToken,
        putUserSubjects,
        becomeInstructor,
        putUserActiveFalse,
        getCertificate,
        getCourses,
        getCourse,
        getMyCourses,
        createCourse,
        cancelCourse,
        createSubCourse,
        cancelSubCourse,
        createLecture,
        cancelLecture,
        registerTutee,
        registerTutor,
        editCourse,
        joinCourse,
        leaveCourse,
        submitCourse,
        publishSubCourse,
        sendCourseGroupMail,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
