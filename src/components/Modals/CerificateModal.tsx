import React, { useContext, useState, useEffect } from 'react';
import StyledReactModal from 'styled-react-modal';
import ClipLoader from 'react-spinners/ClipLoader';
import { Select, DatePicker, InputNumber, message, Checkbox } from 'antd';
import moment from 'moment';

import context from '../../context';
import classes from './CertificateModal.module.scss';
import { Title, Text } from '../Typography';
import Button from '../button';
import Icons from '../../assets/icons';
import { User } from '../../types';
import ActivityForm from '../forms/ActivityForm';
import {
  defaultLanguage,
  ISupportedLanguage,
  supportedLanguages,
} from '../../types/Certificate';
import { useAPICallable } from '../../context/ApiContext';

const { Option } = Select;

interface Props {
  user: User;
  reloadCertificates: () => void;
}

export interface Activity {
  index: number;
  text: string;
}

export interface CertificateData {
  student?: string;
  endDate: number;
  weekCount: number;
  hoursPerWeek: number;
  hoursTotal: number;
  subjects: string[];
  mediaType: string | null;
  activities: string[];
  ongoingLessons: boolean;
  lang?: ISupportedLanguage;
}

const CertificateModal: React.FC<Props> = ({ user, reloadCertificates }) => {
  const modalContext = useContext(context.Modal);
  const [createdCertificate, createCertificate] = useAPICallable(
    'createCertificate'
  );

  // If the certificate was created, the cards need to be reloaded on the Settings page:
  useEffect(() => {
    if (createdCertificate.value) reloadCertificates();
  }, [createdCertificate]);

  return (
    <StyledReactModal isOpen={modalContext.openedModal === 'certificateModal'}>
      <div className={classes.modal}>
        {createdCertificate.pending && (
          <CreateCertificate
            user={user}
            createCertificate={createCertificate}
          />
        )}
        {createdCertificate.value && (
          <DownloadCertificate uuid={createdCertificate.value.uuid} />
        )}
      </div>
    </StyledReactModal>
  );
};

/* ------------------ Certificate Creation Process ------------------ */

const STEPS = ['introduction', 'information', 'activity', 'mode'] as const;
type IStep = typeof STEPS[number];

/* CreateCertificate guides the user throught the creation process and shows different steps with inputs.
   Afterwards it passes all the data to the 'createCertificate' function */
function CreateCertificate({
  user,
  createCertificate,
}: {
  user: User;
  createCertificate(data: CertificateData);
}) {
  const [step, setStep] = useState<typeof STEPS[number]>('introduction');

  /* a 'nextStep' is not provided, as each step has to validate the user inputs anyways,
     so a reusable function does provide no value at all */
  const prevStep = () => setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);

  const [data, setData] = useState<CertificateData>({
    endDate: moment().unix(),
    weekCount: 0,
    hoursPerWeek: 1.0,
    hoursTotal: 0,
    subjects: [],
    mediaType: null,
    activities: [],
    ongoingLessons: false,
  });

  function updateData(update: Partial<CertificateData>) {
    setData((prev) => ({ ...prev, ...update }));
  }

  useEffect(() => {
    const allMatches = [...user.matches, ...user.dissolvedMatches];
    const selectedPupil = allMatches.find((s) => s.uuid === data.student);
    if (selectedPupil) {
      const b = moment(new Date(selectedPupil.date), 'DD/MM/YYYY');
      const a = moment(new Date(data.endDate * 1000), 'DD/MM/YYYY');

      const weekCount = a.diff(b, 'week');
      updateData({
        weekCount,
        hoursTotal: data.hoursPerWeek * weekCount,
      });
    }
  }, [data.hoursPerWeek, data.endDate, data.student]);

  /* Passing the same props to all steps is so beautiful, this rule just doesn't make sense */
  /* eslint react/jsx-props-no-spreading: "off" */
  const stepProps: StepProps = {
    data,
    updateData,
    setStep,
    prevStep,
    user,
    createCertificate,
  };

  if (step === 'introduction') return <IntroductionStep {...stepProps} />;

  if (step === 'information') return <InformationStep {...stepProps} />;

  if (step === 'activity') return <ActivityStep {...stepProps} />;

  if (step === 'mode') return <ChooseModeStep {...stepProps} />;
}

/* Steps inside the creation process share common behavior, such as their props, title and navigation: */

/* eslint react/no-unused-prop-types: "off" */
interface StepProps {
  createCertificate(data: CertificateData);
  updateData(data: Partial<CertificateData>);
  data: CertificateData;
  prevStep();
  setStep(step: typeof STEPS[number]);
  user: User;
}

function StepContainer({
  prevStep,
  nextStep,
  nextStepText,
  step,
  onClose,
  children,
}: React.PropsWithChildren<{
  prevStep?: () => void;
  nextStep?: () => void;
  nextStepText?: string;
  onClose?: () => void;
  step: IStep;
}>) {
  const modalContext = useContext(context.Modal);

  return (
    <>
      <div className={classes.stepContainer}>
        <div className={classes.titleBar}>
          <Title size="h2">Bescheinigung beantragen</Title>
          <Button
            color="#B5B5B5"
            backgroundColor="#ffffff"
            onClick={() => {
              modalContext.setOpenedModal(null);
              if (onClose) onClose();
            }}
          >
            <Icons.Abort />
          </Button>
        </div>
        {children}
      </div>
      <div className={classes.buttonContainer}>
        {prevStep && (
          <Button backgroundColor="#F4F6FF" color="#4E6AE6" onClick={prevStep}>
            Zurück
          </Button>
        )}
        {nextStep && (
          <Button backgroundColor="#F4F6FF" color="#4E6AE6" onClick={nextStep}>
            {nextStepText ?? 'Weiter'}
          </Button>
        )}
      </div>
    </>
  );
}

function StepHeader({ title, step }: { title: string; step: IStep }) {
  return (
    <Text className={classes.description}>
      Schritt {STEPS.indexOf(step) + 1}/{STEPS.length}: {title}
    </Text>
  );
}

function IntroductionStep({ setStep }: StepProps) {
  return (
    <StepContainer step="introduction" nextStep={() => setStep('information')}>
      <Text>
        Wir möchten uns für dein Engagement in der Corona School bedanken! Für
        deine Tätigkeit stellen wir dir gerne eine Bescheinigung aus, welche du
        bei einer Bewerbung beilegen oder bei deiner Universität einreichen
        kannst.
      </Text>
      <br />
      <Title size="h5" bold>
        Wie funktioniert’s?
      </Title>
      <Text>
        Unsere Bescheinigung besteht aus zwei Teilen, welche von
        unterschiedlichen Personen bestätigt werden. Der Corona School e.V. kann
        euch problemlos Folgendes bestätigen:
        <li>Registrierung auf unserer Plattform</li>
        <li>Durchlaufen eines Eignungsgesprächs</li>
        <li>Vermittlung an eine*n Schüler*in</li>
      </Text>
      <Text>
        Das Ausmaß und die genauen Inhalte der ehrenamtlichen Tätigkeit werden
        durch deine*n Schüler*in bestätigt. Um den Prozess so einfach wie
        möglich zu gestalten, kannst du auf der folgenden Seite
        <li>das zeitliche Ausmaß der ehrenamtlichen Tätigkeit</li>
        <li>die genauen Inhalte und Aufgaben der ehrenamtlichen Tätigkeit</li>
        angeben. Daraus erstellen wir dir ein fertiges PDF, welches du an
        deine*n Schüler*in zum Unterschreiben schicken kannst.
      </Text>
    </StepContainer>
  );
}

// TODO: Split this component up
function InformationStep({
  user,
  data: {
    hoursPerWeek,
    student,
    endDate,
    hoursTotal,
    mediaType,
    ongoingLessons,
    subjects,
    weekCount,
  },
  updateData,
  setStep,
  prevStep,
}: StepProps) {
  const dateFormat = 'DD/MM/YYYY';
  const MediaTypes = ['Video-Chat', 'E-Mail', 'Telefon', 'Chat-Nachrichten'];
  const allMatches = [...user.matches, ...user.dissolvedMatches];

  const isWorkloadAllowed =
    hoursPerWeek % 0.25 === 0 && hoursPerWeek >= 0.25 && hoursPerWeek <= 40.0;

  function nextStep() {
    if (!student) {
      message.info('Ein*e Schüler*in muss ausgewählt sein.');
      return;
    }
    if (subjects.length === 0) {
      message.info('Mindestens ein Fach muss ausgewählt sein.');
      return;
    }
    if (!mediaType) {
      message.info('Ein Medium muss ausgewählt sein.');
      return;
    }
    if (!isWorkloadAllowed) {
      message.info(
        'Deine wöchentliche Arbeitszeit darf nur in 15-Minuten-Schritten angegeben werden. Sie muss mindestens 15 Minuten betragen und darf nicht größer als 40 Stunden sein.'
      );
      return;
    }

    setStep('activity');
  }

  if (allMatches.length === 0) {
    return (
      <StepContainer step="information" prevStep={prevStep}>
        <div>
          <Title size="h2">Zertifikat erstellen</Title>
          <Text>Du hast keine Matches</Text>
        </div>
      </StepContainer>
    );
  }

  const selectedPupil = allMatches.find((s) => s.uuid === student);

  return (
    <StepContainer step="information" prevStep={prevStep} nextStep={nextStep}>
      <div className={classes.generalInformationContainer}>
        <Title size="h5" bold>
          Schüler*in
        </Title>
        <div className={classes.inputField}>
          <Select
            placeholder="Wähle deine*n Schüler*in"
            value={student}
            onChange={(v) => {
              updateData({
                student: v,
                subjects: [],
                /* reset as otherwise an invalid value for the end date may occur 
                    if the current endDate value from a previously selected is before the 
                    startdate that was currently set */
                endDate: moment().unix(),
              });
            }}
            style={{ width: '200px' }}
          >
            {allMatches.map((m) => {
              return (
                <Option
                  key={m.uuid}
                  value={m.uuid}
                >{`${m.firstname} ${m.lastname}`}</Option>
              );
            })}
          </Select>
        </div>
        <Title size="h5" bold>
          Zeitraum
        </Title>
        <div className={classes.inputField}>
          Vom{' '}
          <DatePicker
            disabled
            bordered={false}
            value={moment(selectedPupil?.date)}
            defaultValue={moment(moment(Date.now()), dateFormat)}
            format={dateFormat}
          />{' '}
          bis zum{' '}
          <DatePicker
            disabled={!selectedPupil}
            style={{ marginLeft: '4px', marginRight: '4px' }}
            allowClear={false}
            value={moment(endDate * 1000)}
            onChange={(v) => {
              if (v) {
                updateData({
                  endDate: v.unix(),
                });
              }
            }}
            disabledDate={(currentDate) => {
              return (
                moment().diff(currentDate) <= 0 ||
                moment(currentDate).isBefore(selectedPupil.date)
              );
            }}
            format={dateFormat}
          />{' '}
          ({weekCount} Wochen)
        </div>
        <div className={classes.inputField}>
          <Checkbox
            checked={ongoingLessons}
            onChange={(e) =>
              updateData({
                ongoingLessons: e.target.checked,
              })
            }
          >
            Unterstützung dauert noch an
          </Checkbox>
        </div>
        <Title size="h5" bold>
          Fächer
        </Title>
        <div className={classes.inputField}>
          <Select
            disabled={!selectedPupil}
            onChange={(v: string[]) => {
              updateData({ subjects: v });
            }}
            value={subjects}
            mode="multiple"
            placeholder={
              selectedPupil
                ? 'Wähle deine Fächer aus'
                : 'Zuerst einen Schüler auswählen'
            }
            style={{ width: '100%' }}
          >
            {selectedPupil?.subjects.map((s) => {
              return (
                <Option key={s} value={s}>
                  {s}
                </Option>
              );
            })}
          </Select>
        </div>
        <Title size="h5" bold>
          Medium
        </Title>
        <div className={classes.inputField}>
          <Select
            placeholder="Wähle dein Medium aus"
            style={{ width: 200 }}
            value={mediaType || undefined}
            onChange={(v) => {
              if (v) {
                updateData({ mediaType: v });
              }
            }}
          >
            {MediaTypes.map((m) => {
              return (
                <Option key={m} value={m}>
                  {m}
                </Option>
              );
            })}
          </Select>
        </div>
        <Title size="h5" bold>
          Zeit
        </Title>
        <div className={classes.inputField}>
          <InputNumber
            min={0.25}
            max={40}
            step={0.25}
            value={hoursPerWeek}
            onChange={(v) => {
              if (typeof v === 'number') {
                updateData({ hoursPerWeek: v });
              }
            }}
            className={
              !isWorkloadAllowed ? classes.workloadInputFieldError : null
            }
          />{' '}
          h/Woche (insgesamt {hoursTotal} h)
        </div>
      </div>
    </StepContainer>
  );
}

function ActivityStep({ data, updateData, setStep, prevStep }: StepProps) {
  function nextStep() {
    if (data.activities.length === 0) {
      message.info('Mindestens eine Tätigkeit muss ausgewählt sein.');
      return;
    }

    setStep('mode');
  }

  return (
    <StepContainer step="activity" nextStep={nextStep} prevStep={prevStep}>
      <StepHeader step="activity" title="Tätigkeiten eintragen" />
      <ActivityForm certificateData={data} setCertificateData={updateData} />
    </StepContainer>
  );
}

function ChooseModeStep({ data, prevStep, createCertificate }: StepProps) {
  return (
    <StepContainer step="mode" prevStep={prevStep}>
      <StepHeader step="mode" title="Modus auswählen" />
      {/* <Button onClick={() => createCertificate({ ...data, automatic: true })}>
        Automatischer Prozess
      </Button> */}
      <Button onClick={() => createCertificate(data)}>Manuell</Button>
    </StepContainer>
  );
}

/* The DownloadCertificate is shown when the user chooses the Manual Process, and directly
   wants to download their certificate to send it to the pupil */
function DownloadCertificate({ uuid }: { uuid: string }) {
  const [certificateBlob, loadCertificate] = useAPICallable('getCertificate');
  const [language, setLanguage] = useState<ISupportedLanguage>(defaultLanguage);

  /* If the certificate was loaded, automatically download it */
  useEffect(() => {
    if (!certificateBlob.value) return;

    try {
      const url = window.URL.createObjectURL(new Blob([certificateBlob.value]));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'certificate.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      message.error('Ein Fehler ist aufgetreten. Kontaktiere die CoronaSchool');
    }
  }, [certificateBlob]);

  if (certificateBlob.loading) {
    return (
      <div>
        <Text className={classes.description}>Bescheinigung herunterladen</Text>
        <div className={classes.downloadContainer}>
          <ClipLoader size={20} color="#ffffff" loading />
        </div>
      </div>
    );
  }

  if (certificateBlob.error) {
    return (
      <div>
        <Text className={classes.description}>Bescheinigung herunterladen</Text>
        <div className={classes.downloadContainer}>
          Ein Fehler ist aufgetreten. Bitte lade die Seite neu, und versuche es
          erneut.
        </div>
      </div>
    );
  }

  if (certificateBlob.value) {
    return (
      <div>
        <Text className={classes.description}>Bescheinigung herunterladen</Text>
        <div className={classes.downloadContainer}>
          Die Bescheinigung wurde heruntergeladen
        </div>
      </div>
    );
  }

  return (
    <div>
      <Text className={classes.description}>Bescheinigung herunterladen</Text>

      <div className={classes.downloadContainer}>
        <Select
          value={language}
          onChange={(lang) => setLanguage(lang)}
          style={{ width: 120 }}
        >
          {Object.entries(supportedLanguages).map(([code, value]) => (
            <Option value={code}>{value}</Option>
          ))}
        </Select>
        <Button
          className={classes.downloadButton}
          backgroundColor="#4E6AE6"
          color="#ffffff"
          onClick={() => loadCertificate(uuid, language)}
        >
          Download
        </Button>
      </div>
    </div>
  );
}

export default CertificateModal;
