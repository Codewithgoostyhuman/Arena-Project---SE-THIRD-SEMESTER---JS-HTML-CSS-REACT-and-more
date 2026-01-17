// backend/routes/leagueRoutes.js
import express from 'express';
import * as leagueController from '../controllers/leagueController.js';
import { authenticate, authorizeRoles, Roles } from '../middleWare/auth.js';

const router = express.Router();

router.get("/my",authenticate,authorizeRoles(Roles.LEAGUE_OWNER,Roles.OPERATOR),leagueController.getLeaguesByOwner)
router.get('/active',authenticate,leagueController.getActiveLeagues)
router.get('/:leagueId/pending-applications-count',authenticate,authorizeRoles(Roles.LEAGUE_OWNER),leagueController.getPendingApplicationsCount)
/* ================================
   LEAGUE CRUD
================================ */
router.post(
  '/',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.createLeague
);

router.put(
  '/:leagueId',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.updateLeague
);

router.delete(
  '/:leagueId',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.deleteLeague
);

router.get(
  '/:leagueId',
  authenticate,
  leagueController.getLeague
);

router.get(
  '/',
  authenticate,
  leagueController.getActiveLeagues
);

/* ================================
   LEAGUE PLAYERS
================================ */
router.get(
  '/:leagueId/players',
  authenticate,
  leagueController.getPlayers
);

// Operator manually adds a player
router.post(
  '/:leagueId/player',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.addPlayer
);

// Player leaves league
router.post(
  '/:leagueId/leave',
  authenticate,
  authorizeRoles(Roles.PLAYER),
  leagueController.leaveLeague
);

/* ================================
   LEAGUE TOURNAMENTS
================================ */
router.get(
  '/:leagueId/tournaments',
  authenticate,
  leagueController.getTournaments
);

/* ================================
   LEAGUE APPLICATIONS
================================ */
router.get(
  '/:leagueId/applications',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.getApplications
);

router.post(
  '/:leagueId/application/:applicationId/approve',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.approveApplication
);

router.post(
  '/:leagueId/application/:applicationId/reject',
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  leagueController.rejectApplication
);

// Player applies to league
router.post(
  '/:leagueId/apply',
  authenticate,
  authorizeRoles(Roles.PLAYER),
  leagueController.applyToLeague
);

export default router;
