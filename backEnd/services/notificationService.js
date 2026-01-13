// backend/services/notificationService.js
import Notification from "../schemas/notificationSchema.js";
import User from "../schemas/UserSchema.js";
import InterestGroup from "../schemas/InterestGroupSchema.js";
import emailService from "./emailService.js";

class NotificationService {
  /**
   * Create in-app notification
   */
  async createNotification(userId, notificationData) {
    const notification = new Notification({
      user: userId,
      ...notificationData
    });

    await notification.save();
    return notification;
  }

  /**
   * Send tournament announcement to interest groups
   */
  async notifyTournamentAnnouncement(tournament, leagueId, gameId) {
    try {
      // Find relevant interest groups
      const interestGroups = await InterestGroup.find({
        $or: [
          { leagues: leagueId },
          { games: gameId }
        ]
      }).populate("members", "email name");

      if (interestGroups.length === 0) {
        return { notified: 0 };
      }

      // Collect unique users
      const usersToNotify = new Set();
      interestGroups.forEach(group => {
        group.members.forEach(member => {
          usersToNotify.add(member._id.toString());
        });
      });

      const notificationData = {
        type: "tournament_announced",
        title: `New Tournament: ${tournament.name}`,
        message: `A new tournament has been announced! Applications open on ${new Date(tournament.applicationStartDate).toLocaleDateString()}`,
        link: `/tournaments/${tournament._id}`,
        relatedTournament: tournament._id
      };

      // Create in-app notifications
      const notificationPromises = Array.from(usersToNotify).map(userId =>
        this.createNotification(userId, notificationData)
      );

      await Promise.all(notificationPromises);

      // Send emails
      const emailPromises = Array.from(usersToNotify).map(async (userId) => {
        const user = await User.findById(userId);
        if (user && user.email) {
          return emailService.sendTournamentAnnouncement(
            user.email,
            user.name,
            {
              name: tournament.name,
              league: tournament.league.name || "Unknown",
              applicationStartDate: tournament.applicationStartDate,
              applicationEndDate: tournament.applicationEndDate,
              link: `${process.env.CLIENT_URL}/tournaments/${tournament._id}`
            }
          );
        }
      });

      await Promise.all(emailPromises.filter(Boolean));

      return { notified: usersToNotify.size };
    } catch (error) {
      console.error("Notification error:", error);
      throw error;
    }
  }

  /**
   * Notify player about match scheduled
   */
  async notifyMatchScheduled(matchId, playerId, tournamentName, opponentName) {
    try {
      const user = await User.findById(playerId);
      if (!user) return;

      // Create in-app notification
      await this.createNotification(playerId, {
        type: "match_scheduled",
        title: "Match Scheduled",
        message: `Your match against ${opponentName} has been scheduled`,
        link: `/matches/${matchId}`,
        relatedMatch: matchId
      });

      // Send email
      if (user.email) {
        await emailService.sendMatchScheduled(
          user.email,
          user.name,
          {
            tournament: tournamentName,
            opponent: opponentName,
            scheduledTime: new Date(),
            link: `${process.env.CLIENT_URL}/matches/${matchId}`
          }
        );
      }
    } catch (error) {
      console.error("Match notification error:", error);
    }
  }

  /**
   * Notify about application status
   */
  async notifyApplicationStatus(userId, type, name, status, resourceId) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Create in-app notification
      await this.createNotification(userId, {
        type: status === "approved" ? "application_approved" : "application_rejected",
        title: `Application ${status === "approved" ? "Approved" : "Rejected"}`,
        message: `Your application to ${name} has been ${status}`,
        link: type === "league" ? `/leagues/${resourceId}` : `/tournaments/${resourceId}`,
        ...(type === "league" ? { relatedLeague: resourceId } : { relatedTournament: resourceId })
      });

      // Send email
      if (user.email) {
        await emailService.sendApplicationStatus(
          user.email,
          user.name,
          {
            type,
            name,
            status,
            link: `${process.env.CLIENT_URL}/${type}s/${resourceId}`
          }
        );
      }
    } catch (error) {
      console.error("Application notification error:", error);
    }
  }

  /**
   * Notify about tournament results
   */
  async notifyTournamentResults(tournamentId, players, winnerName) {
    try {
      const notificationPromises = players.map(async (player, index) => {
        const user = await User.findById(player._id);
        if (!user) return;

        // Create in-app notification
        await this.createNotification(player._id, {
          type: "tournament_results",
          title: "Tournament Complete",
          message: `Tournament has ended. Winner: ${winnerName}`,
          link: `/tournaments/${tournamentId}`,
          relatedTournament: tournamentId
        });

        // Send email
        if (user.email) {
          await emailService.sendTournamentResults(
            user.email,
            user.name,
            {
              tournament: "Tournament Name", // Pass from caller
              position: index + 1,
              winner: winnerName,
              stats: player.stats || { wins: 0, losses: 0, draws: 0, points: 0 },
              link: `${process.env.CLIENT_URL}/tournaments/${tournamentId}`
            }
          );
        }
      });

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error("Tournament results notification error:", error);
    }
  }

  /**
   * Send sponsorship request to advertiser
   */
  async notifySponsorshipRequest(advertiserId, tournamentName, leagueName, flatFee, tournamentId) {
    try {
      const user = await User.findOne({ advertiserProfile: advertiserId });
      if (!user) return;

      // Create in-app notification
      await this.createNotification(user._id, {
        type: "sponsorship_request",
        title: "Sponsorship Opportunity",
        message: `Exclusive sponsorship available for ${tournamentName}`,
        link: `/tournaments/${tournamentId}`,
        relatedTournament: tournamentId
      });

      // Send email
      if (user.email) {
        await emailService.sendSponsorshipRequest(
          user.email,
          user.name,
          {
            tournament: tournamentName,
            league: leagueName,
            flatFee,
            link: `${process.env.CLIENT_URL}/tournaments/${tournamentId}`
          }
        );
      }
    } catch (error) {
      console.error("Sponsorship notification error:", error);
    }
  }

  /**
   * Get user notifications (paginated)
   */
  async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    const skip = (page - 1) * limit;
    const query = { user: userId };
    
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("relatedTournament", "name")
      .populate("relatedMatch", "players")
      .populate("relatedLeague", "name");

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ user: userId, read: false });

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return await notification.markAsRead();
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true, readAt: new Date() }
    );

    return { updated: result.modifiedCount };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId) {
    const result = await Notification.deleteMany({
      user: userId,
      read: true
    });

    return { deleted: result.deletedCount };
  }
}

export default new NotificationService();