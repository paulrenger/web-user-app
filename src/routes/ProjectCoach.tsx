import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from 'styled-components';
import { Empty } from 'antd';
import { Text, Title } from '../components/Typography';
import context from '../context';
import classes from './ProjectCoach.module.scss';
import { LeftHighlightCard } from '../components/cards/FlexibleHighlightCard';
import BecomeProjectCoachModal from '../components/Modals/BecomeProjectCoachModal';
import BecomeProjectCoacheeModal from '../components/Modals/BecomeProjectCoacheeModal';
import { UserContext } from '../context/UserContext';
import { ProjectMatchCard } from '../components/cards/MatchCard';
import OpenRequestCard from '../components/cards/OpenRequestCard';
import { ScreeningStatus } from '../types';
import {
  BecomeCoacheeText,
  BecomeCoachText,
} from '../assets/ProjectCoachingAssets';
import CancelMatchModal from '../components/Modals/CancelMatchModal';
import { ExpertRequestCard } from '../components/cards/ExpertRequestCard';
import { ApiContext } from '../context/ApiContext';
import { Expert } from '../types/Expert';
import { JufoExpertDetailCard } from '../components/cards/JufoExpertDetailCard';
import AccentColorButton from '../components/button/AccentColorButton';

const ProjectCoach: React.FC = () => {
  const { user } = useContext(context.User);
  const theme = useContext(ThemeContext);
  const modalContext = useContext(context.Modal);
  const userContext = useContext(UserContext);
  const apiContext = useContext(ApiContext);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [pinnedExperts, setPinnedExperts] = useState([]);

  const getPinnedExperts = () => {
    const stringExperts = window.localStorage.getItem('experts');
    if (!stringExperts) {
      return;
    }
    try {
      const experts = JSON.parse(stringExperts);
      if (experts instanceof Array) {
        setPinnedExperts(experts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPinnedExperts();
  }, [modalContext.openedModal]);

  useEffect(() => {
    if (
      !userContext.user.isProjectCoachee &&
      !userContext.user.isProjectCoach
    ) {
      return;
    }
    apiContext.getJufoExperts().then((experts) => {
      setExperts(experts);
    });
  }, [userContext.user]);

  const BecomeProjectCoach = () => {
    return (
      <LeftHighlightCard highlightColor={theme.color.cardHighlightYellow}>
        <Title size="h3">
          Schüler:innen bei außerschulischen Projekten unterstützen
        </Title>
        <Text>{BecomeCoachText}</Text>
        <AccentColorButton
          accentColor="#e78b00"
          className={classes.buttonParticipate}
          onClick={() => modalContext.setOpenedModal('becomeProjectCoach')}
          label="Jetzt 1:1-Projektcoach werden"
          small
        />
      </LeftHighlightCard>
    );
  };

  const BecomeProjectCoachee = () => {
    return (
      <LeftHighlightCard highlightColor={theme.color.cardHighlightYellow}>
        <Title size="h3">Unterstützung bei Projekten bekommen</Title>
        <Text>{BecomeCoacheeText}</Text>
        <AccentColorButton
          accentColor="#e78b00"
          className={classes.buttonParticipate}
          onClick={() => modalContext.setOpenedModal('becomeProjectCoachee')}
          label="Jetzt anmelden"
          small
        />
      </LeftHighlightCard>
    );
  };

  const renderJufoExpertCards = () => {
    if (!user.isProjectCoachee) {
      return null;
    }
    const myExperts = experts.filter((e) => pinnedExperts.includes(e.id));
    return (
      <div className={classes.experts}>
        <Title size="h2">Deine Expert:innen</Title>
        <div className={classes.cardContainer}>
          {myExperts.map((e) => (
            <div className={classes.expertContainer}>
              <div className={classes.expertMatchBar} />
              <div className={classes.paddingContainer}>
                <JufoExpertDetailCard
                  expert={e}
                  type="card"
                  onUnpin={getPinnedExperts}
                />
              </div>
            </div>
          ))}
          <ExpertRequestCard
            onClick={() => modalContext.setOpenedModal('expertOverviewModal')}
          />
        </div>
      </div>
    );
  };

  const Matches = () => {
    const openRequests = (() => {
      if (userContext.user.type === 'pupil') {
        if (
          userContext.user.projectMatches.filter((match) => !match.dissolved)
            .length === 1
        ) {
          return (
            <Empty description="Du hast im Moment keine offenen Anfragen." />
          );
        }
        if (userContext.user.projectMatchesRequested === 0) {
          return (
            <OpenRequestCard
              type="new"
              userType={userContext.user.type}
              projectCoaching
              disabled={
                userContext.user.isPupil &&
                userContext.user.matchesRequested > 0
              }
            />
          );
        }
        if (userContext.user.projectMatchesRequested >= 1) {
          return (
            <>
              {[...Array(userContext.user.projectMatchesRequested).keys()].map(
                () => (
                  <OpenRequestCard
                    type="pending"
                    userType={userContext.user.type}
                    projectCoaching
                    disabled={false}
                  />
                )
              )}
            </>
          );
        }
      }

      if (userContext.user.projectMatchesRequested === 0) {
        return (
          <OpenRequestCard
            type="new"
            userType={userContext.user.type}
            projectCoaching
            disabled={false}
          />
        );
      }

      return (
        <>
          {[...Array(userContext.user.projectMatchesRequested).keys()].map(
            (_, i) => (
              <OpenRequestCard
                // eslint-disable-next-line react/no-array-index-key
                key={`project-request-${i}`}
                type="pending"
                userType={userContext.user.type}
                projectCoaching
                disabled={false}
              />
            )
          )}
          {userContext.user.projectMatchesRequested < 3 && (
            <OpenRequestCard
              type="new"
              userType={userContext.user.type}
              projectCoaching
              disabled={false}
            />
          )}
        </>
      );
    })();

    const currentMatches = userContext.user.projectMatches
      .filter((match) => !match.dissolved)
      .map((match) => (
        <React.Fragment key={match.uuid}>
          <ProjectMatchCard
            match={match}
            type={userContext.user.type === 'student' ? 'coachee' : 'coach'}
            handleDissolveMatch={() => {
              modalContext.setOpenedModal(
                `cancelProjectMatchModal${match.uuid}`
              );
            }}
          />
          <CancelMatchModal
            identifier={`cancelProjectMatchModal${match.uuid}`}
            matchUuid={match.uuid}
            matchFirstname={match.firstname}
            ownType={userContext.user.type}
            projectCoaching
          />
        </React.Fragment>
      ));

    const dissolvedMatches = userContext.user.projectMatches
      .filter((match) => match.dissolved)
      .map((match) => (
        <React.Fragment key={match.uuid}>
          <ProjectMatchCard
            match={match}
            type={userContext.user.type === 'student' ? 'coachee' : 'coach'}
            handleDissolveMatch={() => {}}
          />
        </React.Fragment>
      ));

    return (
      <div className={classes.containerRequests}>
        <div className={classes.openRequests}>{openRequests}</div>
        {renderJufoExpertCards()}
        <Title size="h2">Deine Zuordnungen</Title>
        {currentMatches.length === 0 && (
          <Empty
            style={{ maxWidth: '1000px' }}
            description="Du hast keine aktiven Zuordnungen"
          />
        )}
        {currentMatches}
        {dissolvedMatches.length > 0 && (
          <Title size="h2">Entfernte Zuordnungen</Title>
        )}
        {dissolvedMatches}
      </div>
    );
  };

  return (
    <div className={classes.container}>
      <Title size="h1">1:1-Projektcoaching</Title>
      {!user.isProjectCoach && user.isTutor && <BecomeProjectCoach />}
      {!user.isProjectCoachee && user.type === 'pupil' && (
        <BecomeProjectCoachee />
      )}
      {((user.isProjectCoach &&
        user.projectCoachingScreeningStatus === ScreeningStatus.Accepted) ||
        user.isProjectCoachee) && <Matches />}
      <BecomeProjectCoachModal />
      <BecomeProjectCoacheeModal />
    </div>
  );
};

export default ProjectCoach;
