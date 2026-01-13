import express from "express";
import { authenticate, authorizeRoles, Roles } from "../middleWare/auth.js";
import * as tournamentController from "../controllers/tournamentController.js";

const router = express.Router();
export const getLiveTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find({ 
      status: 'in-progress',
      visibility: 'public' // Assuming you have a visibility field
    })
    .populate('league', 'name logo')
    .populate('game', 'name')
    .sort({ startDate: -1 })
    .limit(10);

    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching live tournaments:', error);
    next(error);
  }
};

export const getUpcomingTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find({ 
      status: 'registration',
      startDate: { $gt: new Date() },
      visibility: 'public'
    })
    .populate('league', 'name logo')
    .populate('game', 'name')
    .sort({ startDate: 1 })
    .limit(10);

    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    next(error);
  }
};

export const getTournamentById = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    
    const tournament = await Tournament.findById(tournamentId)
      .populate('league', 'name logo')
      .populate('game', 'name')
      .populate('winners.player', 'username avatar');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    next(error);
  }
};

/* =======================
   PLAYER ROUTES
======================= */
router.post(
  "/:tournamentId/apply",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.applyToTournament
);

router.get(
  "/available",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getAvailableTournaments
);

router.get(
  "/my-tournaments",
  authenticate,
  authorizeRoles(Roles.PLAYER),
  tournamentController.getPlayerTournaments
);

/* =======================
   LEAGUE OWNER / OPERATOR ROUTES
======================= */
router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.createTournament
);

router.put(
  "/:tournamentId",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.updateTournament
);

router.delete(
  "/:tournamentId",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.deleteTournament
);

router.post(
  "/:tournamentId/complete",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.completeTournament
);

router.post(
  "/:tournamentId/application/:applicationId/:action",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.updateApplicationStatus
);

router.post(
  "/:tournamentId/match/:matchId/result",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.recordMatchResult
);

router.post(
  "/:tournamentId/sponsorship/exclusive",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.addExclusiveSponsor
);

router.post(
  "/:tournamentId/advertisement",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.addAdvertisement
);

router.post(
  "/:tournamentId/notify-groups",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.notifyGroups
);

router.get(
  "/:tournamentId/winners",
  authenticate,
  tournamentController.getTournamentWinners
);

router.get(
  "/:tournamentId/players",
  authenticate,
  tournamentController.getTournamentPlayers
);
router.post(
  "/:tournamentId/kickoff",
  authenticate,
  authorizeRoles(Roles.LEAGUE_OWNER, Roles.OPERATOR),
  tournamentController.kickoffTournament
);


export default router;
