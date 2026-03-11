import {
  Notification,
  NotificationType,
} from "@/services/notification.service";

/**
 * Notification events matching NOTIFICATION_SYSTEM.md
 */
export enum NotificationEvent {
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  NEW_PROBLEM_REPORT = "NEW_PROBLEM_REPORT",
  PROBLEM_SOLVED = "PROBLEM_SOLVED",
  POST_PUBLISHED = "POST_PUBLISHED",
  POST_COMMENT = "POST_COMMENT",
  POST_COMMENT_REPLY = "POST_COMMENT_REPLY",
  SOLUTION_COMMENT = "SOLUTION_COMMENT",
  SOLUTION_COMMENT_REPLY = "SOLUTION_COMMENT_REPLY",
  PROBLEM_COMMENT_REPLY = "PROBLEM_COMMENT_REPLY",
  STUDY_PLAN_COMPLETED = "STUDY_PLAN_COMPLETED",
  STUDY_PLAN_MILESTONE = "STUDY_PLAN_MILESTONE",
  STUDY_PLAN_DAY_COMPLETED = "STUDY_PLAN_DAY_COMPLETED",
}

/**
 * Strategy interface for handling different notification types
 */
export interface NotificationStrategy {
  /**
   * Generates the frontend link for the notification
   */
  getLink(notification: Notification): string;
}

// --- Payment Strategies ---
class PaymentSuccessStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { transactionId } = notification.metadata || {};
    return transactionId
      ? `/settings?tab=billing#transaction-${transactionId}`
      : "/settings?tab=billing";
  }
}

// --- Problem Strategies ---
class NewProblemReportStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { problemId } = notification.metadata || {};
    return problemId ? `/problems/${problemId}/description` : "/problems";
  }
}

class ProblemSolvedStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { problemId, submissionId } = notification.metadata || {};
    if (problemId && submissionId) {
      return `/problems/${problemId}/submissions/${submissionId}`;
    }
    return problemId ? `/problems/${problemId}/description` : "/problems";
  }
}

class ProblemCommentReplyStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { problemId, commentId } = notification.metadata || {};
    if (!problemId) return "/problems";
    return commentId
      ? `/problems/${problemId}/description#comment-${commentId}`
      : `/problems/${problemId}/description`;
  }
}

// --- Post/Discuss Strategies ---
class PostPublishedStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { postId } = notification.metadata || {};
    return postId ? `/discuss/${postId}` : "/discuss";
  }
}

class PostCommentStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { postId, commentId } = notification.metadata || {};
    if (!postId) return "/discuss";
    return commentId
      ? `/discuss/${postId}#comment-${commentId}`
      : `/discuss/${postId}`;
  }
}

class PostCommentReplyStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { postId, commentId } = notification.metadata || {};
    if (!postId) return "/discuss";
    return commentId
      ? `/discuss/${postId}#comment-${commentId}`
      : `/discuss/${postId}`;
  }
}

// --- Solution Strategies ---
class SolutionCommentStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { problemId, solutionId, commentId } = notification.metadata || {};
    if (!problemId || !solutionId) return "/problems";
    return commentId
      ? `/problems/${problemId}/solutions/${solutionId}#comment-${commentId}`
      : `/problems/${problemId}/solutions/${solutionId}`;
  }
}

class SolutionCommentReplyStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { problemId, solutionId, commentId } = notification.metadata || {};
    if (!problemId || !solutionId) return "/problems";
    return commentId
      ? `/problems/${problemId}/solutions/${solutionId}#comment-${commentId}`
      : `/problems/${problemId}/solutions/${solutionId}`;
  }
}

// --- Study Plan Strategies ---
class StudyPlanCompletedStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { studyPlanSlug } = notification.metadata || {};
    return studyPlanSlug ? `/study-plans/${studyPlanSlug}` : "/study-plans";
  }
}

class StudyPlanMilestoneStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { studyPlanSlug } = notification.metadata || {};
    return studyPlanSlug ? `/study-plans/${studyPlanSlug}` : "/study-plans";
  }
}

class StudyPlanDayCompletedStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    const { studyPlanSlug } = notification.metadata || {};
    return studyPlanSlug ? `/study-plans/${studyPlanSlug}` : "/study-plans";
  }
}

// --- Defaults ---
class DefaultStrategy implements NotificationStrategy {
  getLink(notification: Notification): string {
    return "#";
  }
}

/**
 * Factory to retrieve the appropriate strategy for a notification
 */
export class NotificationStrategyFactory {
  static getStrategy(notification: Notification): NotificationStrategy {
    const { type, metadata } = notification;
    const event = metadata?.event;

    // First, try matching by event for granular control (matching NOTIFICATION_SYSTEM.md)
    if (event) {
      const upperEvent = event.toUpperCase() as NotificationEvent;
      switch (upperEvent) {
        case NotificationEvent.PAYMENT_SUCCESS:
          return new PaymentSuccessStrategy();

        case NotificationEvent.NEW_PROBLEM_REPORT:
          return new NewProblemReportStrategy();

        case NotificationEvent.PROBLEM_SOLVED:
          return new ProblemSolvedStrategy();

        case NotificationEvent.POST_PUBLISHED:
          return new PostPublishedStrategy();

        case NotificationEvent.POST_COMMENT:
          return new PostCommentStrategy();

        case NotificationEvent.POST_COMMENT_REPLY:
          return new PostCommentReplyStrategy();

        case NotificationEvent.SOLUTION_COMMENT:
          return new SolutionCommentStrategy();

        case NotificationEvent.SOLUTION_COMMENT_REPLY:
          return new SolutionCommentReplyStrategy();

        case NotificationEvent.PROBLEM_COMMENT_REPLY:
          return new ProblemCommentReplyStrategy();

        case NotificationEvent.STUDY_PLAN_COMPLETED:
          return new StudyPlanCompletedStrategy();

        case NotificationEvent.STUDY_PLAN_MILESTONE:
          return new StudyPlanMilestoneStrategy();

        case NotificationEvent.STUDY_PLAN_DAY_COMPLETED:
          return new StudyPlanDayCompletedStrategy();
      }
    }

    // Fallback to type-based matching for robustness
    switch (type) {
      case NotificationType.STUDY_PLAN:
        return new StudyPlanDayCompletedStrategy();
      case NotificationType.PAYMENT:
        return new PaymentSuccessStrategy();
      case NotificationType.SUBMISSION:
        return new ProblemSolvedStrategy();
      case NotificationType.DISCUSS:
        return new PostPublishedStrategy();
      case NotificationType.COMMENT:
      case NotificationType.REPLY:
        if (metadata?.solutionId) return new SolutionCommentStrategy();
        if (metadata?.postId) return new PostCommentStrategy();
        return new ProblemCommentReplyStrategy();
      case NotificationType.SYSTEM:
      default:
        return new DefaultStrategy();
    }
  }
}
