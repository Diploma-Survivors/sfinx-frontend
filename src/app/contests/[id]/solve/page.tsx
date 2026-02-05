'use client';

import ContestDrawer from '@/components/contest/contest-drawer';
import { ContestSolveSkeleton } from '@/components/contest/contest-solve-skeleton';
import ContestSolveNavbar from '@/components/contest/solve/contest-solve-navbar';
import ContestProblemWrapper from '@/components/problems/tabs/description/contest-problem-wrapper';
import { ContestsService } from '@/services/contests-service';
import { ProblemsService } from '@/services/problems-service';
import { setContest as setContestAction } from '@/store/slides/contest-slice';
import { setProblem } from '@/store/slides/problem-slice';
import {
  type Contest,
  INITIAL_CONTEST,
  type LeaderboardEntry,
} from '@/types/contests';
import {
  type Problem,
  ProblemDifficulty,
  initialProblemData,
} from '@/types/problems';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

export default function ContestSolvePage() {
  const params = useParams();
  const contestId = params.id as string;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contest, setContest] = useState<Contest>(INITIAL_CONTEST);
  const [currentProblem, setCurrentProblem] =
    useState<Problem>(initialProblemData);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProblemLoading, setIsProblemLoading] = useState(false);

  const dispatch = useDispatch();

  // Fetch Contest Details
  useEffect(() => {
    const fetchContestData = async () => {
      if (!contestId) return;

      try {
        setIsLoading(true);
        const response = await ContestsService.getContestDetail(contestId);
        if (response.data && response.data.data) {
          const contestData = response.data.data;
          setContest(contestData);
          dispatch(setContestAction(contestData));

          // Set initial problem if available
          if (
            contestData.contestProblems &&
            contestData.contestProblems.length > 0
          ) {
            fetchProblemDetail(
              contestData.contestProblems[0].problem.id.toString()
            );
          }
        }
      } catch (error) {
        console.error('Error fetching contest details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContestData();
  }, [contestId]);

  // Fetch Leaderboard Data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!contestId) return;

      try {
        const [leaderboardRes, userRankRes] = await Promise.all([
          ContestsService.getContestLeaderboard(contestId, {
            page: 1,
            limit: 100,
          }),
          ContestsService.getContestLeaderboardMe(contestId),
        ]);

        if (leaderboardRes.data && leaderboardRes.data.data) {
          setLeaderboard(leaderboardRes.data.data.data);
        }

        if (userRankRes.data && userRankRes.data.data) {
          setUserRank(userRankRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    if (isDrawerOpen) {
      fetchLeaderboard();

      const interval = setInterval(() => {
        fetchLeaderboard();
      }, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [contestId, isDrawerOpen]);

  const fetchProblemDetail = async (problemId: string) => {
    try {
      setIsProblemLoading(true);
      const response = await ProblemsService.getProblemById(Number(problemId));
      if (response.data && response.data.data) {
        setCurrentProblem(response.data.data);
        dispatch(setProblem(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching problem detail:', error);
    } finally {
      setIsProblemLoading(false);
    }
  };

  const currentIndex = useMemo(() => {
    if (!contest.contestProblems) return -1;
    return contest.contestProblems.findIndex(
      (p) => p.problem.id === currentProblem.id
    );
  }, [contest.contestProblems, currentProblem.id]);

  const handleNext = () => {
    if (currentIndex < contest.contestProblems.length - 1) {
      const nextProblemId =
        contest.contestProblems[currentIndex + 1].problem.id;
      fetchProblemDetail(nextProblemId.toString());
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevProblemId =
        contest.contestProblems[currentIndex - 1].problem.id;
      fetchProblemDetail(prevProblemId.toString());
    }
  };

  const handleProblemChange = (problemId: string) => {
    fetchProblemDetail(problemId);
  };

  if (isLoading) {
    return <ContestSolveSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden font-sans">
      {/* 1. Global Header */}
      <ContestSolveNavbar
        onMenuClick={() => setIsDrawerOpen(true)}
        onNextProblem={handleNext}
        onPrevProblem={handlePrev}
        hasNext={currentIndex < (contest.contestProblems?.length || 0) - 1}
        hasPrev={currentIndex > 0}
        endTime={contest.endTime}
      />

      {/* 2. Main Split Layout */}
      <div className="flex-1 overflow-hidden relative">
        {isProblemLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <ContestProblemWrapper
            contest={contest}
            problem={currentProblem}
            contestMode={true}
            onSubmitSuccess={() => {
              // Optionally refresh ranking or problem status
            }}
          />
        )}
      </div>

      {/* 3. Contest Drawer (Ranking) */}
      <ContestDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        contestName={contest.title}
        problems={
          contest.contestProblems?.map((cp) => ({
            id: cp.problem.id.toString(),
            title: cp.problem.title,
            maxScore:
              cp.points || cp.problem.difficulty === ProblemDifficulty.EASY
                ? 100
                : cp.problem.difficulty === ProblemDifficulty.MEDIUM
                  ? 200
                  : 300, // Fallback logic
            userScore: 0, // Need to fetch user score per problem if available
            status: cp.problem.status as any, // Type assertion needed or mapping
            difficulty: cp.problem.difficulty,
            memoryLimitKb: cp.problem.memoryLimitKb,
            timeLimitMs: cp.problem.timeLimitMs,
          })) || []
        }
        leaderboard={leaderboard}
        userRank={userRank}
        currentProblemId={currentProblem.id.toString()}
        onProblemClick={handleProblemChange}
      />
    </div>
  );
}
