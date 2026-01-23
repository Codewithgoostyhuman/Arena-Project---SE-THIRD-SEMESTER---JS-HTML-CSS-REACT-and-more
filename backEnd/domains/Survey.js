import Survey from "../schemas/SurveySchema.js";
import User from "../schemas/UserSchema.js";

export default class SurveyDomain {
  
  static async submitSurvey(userId, surveyData) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const survey = new Survey({
      user: userId,
      responses: surveyData.responses,
      interests: surveyData.interests
    });

    await survey.save();
    return survey;
  }

  static async getUserSurvey(userId) {
    return await Survey.findOne({ user: userId }).sort({ completedAt: -1 });
  }

  // Aggregate Reporting for Advertisers
  static async getInterestReport() {
    const report = await Survey.aggregate([
      {
        $facet: {
          "gameInterests": [
            { $unwind: "$interests.games" },
            { $group: { _id: "$interests.games", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          "generalInterests": [
            { $unwind: "$interests.general" },
            { $group: { _id: "$interests.general", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    return report[0];
  }

  static async getSummaryStats() {
    const totalSurveys = await Survey.countDocuments();
    return {
      totalSurveys,
      lastSurveyAt: (await Survey.findOne().sort({ completedAt: -1 }))?.completedAt
    };
  }
}
