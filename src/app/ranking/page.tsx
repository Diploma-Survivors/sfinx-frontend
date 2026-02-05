'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SubmissionsService } from '@/services/submissions-service';
import { UserService } from '@/services/user-service';
import { SubmissionStatus } from '@/types/submissions';
import type { UserProfile } from '@/types/user';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Crown,
  Medal,
  Search,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserRanking extends UserProfile {
  totalScore: number;
  solvedCount: number;
  acceptanceRate: number;
  position: number;
}

type SortField = 'totalScore' | 'solvedCount' | 'acceptanceRate';
type SortOrder = 'asc' | 'desc' | null;

export default function RankingPage() {
  const { t } = useTranslation('ranking');
  const [users, setUsers] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // mock allUsers here
  //       const allUsers = [
  //         {
  //           id: 1,
  //           username: 'user1',
  //           email: 'user1@example.com',
  //           avatarUrl: 'https://example.com/avatar1.jpg',
  //           totalScore: 100,
  //           solvedCount: 10,
  //           acceptanceRate: 80,
  //           position: 1,
  //         },
  //         {
  //           id: 2,
  //           username: 'user2',
  //           email: 'user2@example.com',
  //           avatarUrl: 'https://example.com/avatar2.jpg',
  //           totalScore: 90,
  //           solvedCount: 9,
  //           acceptanceRate: 70,
  //           position: 2,
  //         },
  //         {
  //           id: 3,
  //           username: 'user3',
  //           email: 'user3@example.com',
  //           avatarUrl: 'https://example.com/avatar3.jpg',
  //           totalScore: 80,
  //           solvedCount: 8,
  //           acceptanceRate: 60,
  //           position: 3,
  //         },
  //       ];

  //       // Fetch submissions for each user to calculate stats
  //       const userStatsPromises = allUsers.map(async (user) => {
  //         const submissions = await SubmissionsService.getAllSubmissions(
  //           user.id
  //         );

  //         // Calculate total score based on highest score per problem
  //         const problemBestScores = new Map<string, number>();
  //         submissions.forEach((sub) => {
  //           if (sub.problemId && sub.score !== null) {
  //             const currentBest = problemBestScores.get(sub.problemId) || 0;
  //             if (sub.score > currentBest) {
  //               problemBestScores.set(sub.problemId, sub.score);
  //             }
  //           }
  //         });

  //         const totalScore = Array.from(problemBestScores.values()).reduce(
  //           (acc, score) => acc + score,
  //           0
  //         );

  //         // Count unique solved problems
  //         const solvedProblems = new Set(
  //           submissions
  //             .filter((s) => s.status === SubmissionStatus.ACCEPTED)
  //             .map((s) => s.problemId)
  //         );
  //         const solvedCount = solvedProblems.size;

  //         const totalSubmissions = submissions.length;
  //         const acceptedSubmissions = submissions.filter(
  //           (s) => s.status === SubmissionStatus.ACCEPTED
  //         ).length;

  //         const acceptanceRate =
  //           totalSubmissions > 0
  //             ? (acceptedSubmissions / totalSubmissions) * 100
  //             : 0;

  //         return {
  //           ...user,
  //           totalScore,
  //           solvedCount,
  //           acceptanceRate,
  //         };
  //       });

  //       const usersWithStats = await Promise.all(userStatsPromises);

  //       // Initial Sort (Default Ranking Criteria)
  //       // 1. Total Score (Desc)
  //       // 2. Acceptance Rate (Desc)
  //       // 3. Solved Count (Asc)
  //       const sortedUsers = usersWithStats.sort((a, b) => {
  //         if (b.totalScore !== a.totalScore) {
  //           return b.totalScore - a.totalScore;
  //         }
  //         if (b.acceptanceRate !== a.acceptanceRate) {
  //           return b.acceptanceRate - a.acceptanceRate;
  //         }
  //         return a.solvedCount - b.solvedCount;
  //       });

  //       // Assign positions based on default ranking
  //       const rankedUsers = sortedUsers.map((user, index) => ({
  //         ...user,
  //         position: index + 1,
  //       }));

  //       setUsers(rankedUsers);
  //     } catch (error) {
  //       console.error('Error fetching ranking data:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // const handleSort = (field: SortField) => {
  //   if (sortField === field) {
  //     if (sortOrder === null) setSortOrder('desc');
  //     else if (sortOrder === 'desc') setSortOrder('asc');
  //     else setSortOrder(null);
  //   } else {
  //     setSortField(field);
  //     setSortOrder('desc');
  //   }
  //   setCurrentPage(1); // Reset to first page on sort change
  // };

  // const getSortIcon = (field: SortField) => {
  //   if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1" />;
  //   if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4 ml-1" />;
  //   if (sortOrder === 'desc') return <ArrowDown className="w-4 h-4 ml-1" />;
  //   return <ArrowUpDown className="w-4 h-4 ml-1" />;
  // };

  // const filteredUsers = useMemo(() => {
  //   return users.filter((user) => {
  //     const fullName = `${user.firstName} ${user.lastName}`;
  //     return (
  //       user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       fullName.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   });
  // }, [users, searchQuery]);

  // const sortedUsers = useMemo(() => {
  //   if (!sortField || !sortOrder) return filteredUsers;

  //   return [...filteredUsers].sort((a, b) => {
  //     const valA = a[sortField];
  //     const valB = b[sortField];

  //     if (sortOrder === 'asc') {
  //       return valA > valB ? 1 : -1;
  //     }
  //     return valA < valB ? 1 : -1;
  //   });
  // }, [filteredUsers, sortField, sortOrder]);

  // const paginatedUsers = useMemo(() => {
  //   const startIndex = (currentPage - 1) * itemsPerPage;
  //   return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  // }, [sortedUsers, currentPage]);

  // const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  // const topThree = users.slice(0, 3);

  if (loading) {
    // return (
    //   <div className="min-h-screen bg-background py-12">
    //     <div className="container mx-auto px-4">
    //       <div className="max-w-7xl mx-auto space-y-8">
    //         {/* Header Skeleton */}
    //         <div className="text-center space-y-4 mb-12">
    //           <Skeleton className="h-12 w-64 mx-auto" />
    //           <Skeleton className="h-6 w-96 mx-auto" />
    //         </div>
    //         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    //           {/* Podium Skeleton (Left Panel) */}
    //           <div className="lg:col-span-5 xl:col-span-4 space-y-6">
    //             <Card className="border-none shadow-xl bg-card">
    //               <CardHeader>
    //                 <Skeleton className="h-8 w-48 mx-auto" />
    //               </CardHeader>
    //               <CardContent>
    //                 <div className="flex justify-center items-end gap-4 h-64 pb-4">
    //                   <div className="flex flex-col items-center gap-2">
    //                     <Skeleton className="w-16 h-16 rounded-full" />
    //                     <Skeleton className="w-20 h-4" />
    //                     <Skeleton className="w-24 h-32 rounded-t-lg" />
    //                   </div>
    //                   <div className="flex flex-col items-center gap-2">
    //                     <Skeleton className="w-20 h-20 rounded-full" />
    //                     <Skeleton className="w-24 h-4" />
    //                     <Skeleton className="w-28 h-40 rounded-t-lg" />
    //                   </div>
    //                   <div className="flex flex-col items-center gap-2">
    //                     <Skeleton className="w-16 h-16 rounded-full" />
    //                     <Skeleton className="w-20 h-4" />
    //                     <Skeleton className="w-24 h-24 rounded-t-lg" />
    //                   </div>
    //                 </div>
    //               </CardContent>
    //             </Card>
    //           </div>
    //           {/* Leaderboard Skeleton (Right Panel) */}
    //           <div className="lg:col-span-7 xl:col-span-8">
    //             <Card className="border-none shadow-xl bg-card">
    //               <CardHeader>
    //                 <div className="flex justify-between items-center">
    //                   <Skeleton className="h-8 w-32" />
    //                   <Skeleton className="h-10 w-64" />
    //                 </div>
    //               </CardHeader>
    //               <CardContent>
    //                 <div className="space-y-4">
    //                   {Array.from({ length: 10 }).map((_, i) => (
    //                     <div key={i} className="flex items-center gap-4">
    //                       <Skeleton className="h-8 w-8" />
    //                       <Skeleton className="h-10 w-10 rounded-full" />
    //                       <div className="flex-1 space-y-2">
    //                         <Skeleton className="h-4 w-32" />
    //                         <Skeleton className="h-3 w-24" />
    //                       </div>
    //                       <Skeleton className="h-6 w-16" />
    //                       <Skeleton className="h-6 w-12" />
    //                       <Skeleton className="h-6 w-24" />
    //                     </div>
    //                   ))}
    //                 </div>
    //               </CardContent>
    //             </Card>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
  }

  return (
    <></>
    // <div className="min-h-screen bg-background py-12">
    //   <div className="container mx-auto px-4">
    //     <div className="max-w-7xl mx-auto space-y-8">
    //       {/* Header */}
    //       <div className="text-center space-y-4 mb-12">
    //         <h1 className="text-4xl font-bold text-foreground">
    //           {t('ranking_title')}
    //         </h1>
    //         <p className="text-lg text-muted-foreground">
    //           {t('ranking_subtitle')}
    //         </p>
    //       </div>

    //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    //         {/* Podium Panel */}
    //         <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
    //           <Card className="border-none shadow-xl bg-card overflow-hidden">
    //             <CardHeader className="text-center pb-2">
    //               <CardTitle className="flex items-center justify-center gap-2 text-xl">
    //                 <Trophy className="w-5 h-5 text-yellow-500" />
    //                 {t('top_solvers')}
    //               </CardTitle>
    //             </CardHeader>
    //             <CardContent className="pt-6">
    //               {topThree.length >= 3 ? (
    //                 <div className="flex justify-center items-end gap-2 sm:gap-4">
    //                   {/* 2nd Place */}
    //                   <div className="flex flex-col items-center gap-2 order-1">
    //                     <div className="relative">
    //                       <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-gray-300 shadow-lg">
    //                         <AvatarImage src={topThree[1].avatarUrl} />
    //                         <AvatarFallback>
    //                           {topThree[1].firstName[0]}
    //                         </AvatarFallback>
    //                       </Avatar>
    //                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-0.5">
    //                         <Medal className="w-2.5 h-2.5" /> 2
    //                       </div>
    //                     </div>
    //                     <div className="text-center">
    //                       <div className="font-bold text-sm text-foreground truncate max-w-[80px]">
    //                         {topThree[1].username}
    //                       </div>
    //                       <div className="text-xs text-emerald-600 font-semibold">
    //                         {topThree[1].totalScore} {t('pts')}
    //                       </div>
    //                     </div>
    //                     <div className="w-20 sm:w-24 h-24 sm:h-32 bg-gray-200 dark:bg-gray-800 rounded-t-lg shadow-inner flex items-end justify-center pb-2">
    //                       <span className="text-3xl font-bold text-gray-400/50">
    //                         2
    //                       </span>
    //                     </div>
    //                   </div>

    //                   {/* 1st Place */}
    //                   <div className="flex flex-col items-center gap-2 order-2 -mt-4">
    //                     <div className="relative">
    //                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce">
    //                         <Crown className="w-6 h-6 fill-current" />
    //                       </div>
    //                       <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-yellow-400 shadow-xl ring-4 ring-yellow-400/20">
    //                         <AvatarImage src={topThree[0].avatarUrl} />
    //                         <AvatarFallback>
    //                           {topThree[0].firstName[0]}
    //                         </AvatarFallback>
    //                       </Avatar>
    //                       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-0.5">
    //                         <Trophy className="w-3 h-3" /> 1
    //                       </div>
    //                     </div>
    //                     <div className="text-center">
    //                       <div className="font-bold text-base text-foreground truncate max-w-[100px]">
    //                         {topThree[0].username}
    //                       </div>
    //                       <div className="text-emerald-600 font-bold text-sm">
    //                         {topThree[0].totalScore} {t('pts')}
    //                       </div>
    //                     </div>
    //                     <div className="w-24 sm:w-28 h-32 sm:h-40 bg-yellow-100 dark:bg-yellow-900/30 rounded-t-lg shadow-inner flex items-end justify-center pb-2 border-t border-yellow-200 dark:border-yellow-800">
    //                       <span className="text-4xl font-bold text-yellow-500/50">
    //                         1
    //                       </span>
    //                     </div>
    //                   </div>

    //                   {/* 3rd Place */}
    //                   <div className="flex flex-col items-center gap-2 order-3">
    //                     <div className="relative">
    //                       <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-orange-300 shadow-lg">
    //                         <AvatarImage src={topThree[2].avatarUrl} />
    //                         <AvatarFallback>
    //                           {topThree[2].firstName[0]}
    //                         </AvatarFallback>
    //                       </Avatar>
    //                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-0.5">
    //                         <Medal className="w-2.5 h-2.5" /> 3
    //                       </div>
    //                     </div>
    //                     <div className="text-center">
    //                       <div className="font-bold text-sm text-foreground truncate max-w-[80px]">
    //                         {topThree[2].username}
    //                       </div>
    //                       <div className="text-xs text-emerald-600 font-semibold">
    //                         {topThree[2].totalScore} {t('pts')}
    //                       </div>
    //                     </div>
    //                     <div className="w-20 sm:w-24 h-16 sm:h-24 bg-orange-100 dark:bg-orange-900/30 rounded-t-lg shadow-inner flex items-end justify-center pb-2 border-t border-orange-200 dark:border-orange-800">
    //                       <span className="text-3xl font-bold text-orange-500/50">
    //                         3
    //                       </span>
    //                     </div>
    //                   </div>
    //                 </div>
    //               ) : (
    //                 <div className="text-center py-8 text-muted-foreground">
    //                   {t('not_enough_data')}
    //                 </div>
    //               )}
    //             </CardContent>
    //           </Card>
    //         </div>

    //         {/* Leaderboard Panel */}
    //         <div className="lg:col-span-7 xl:col-span-8">
    //           <Card className="border-none shadow-xl bg-card">
    //             <CardHeader>
    //               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
    //                 <CardTitle>{t('leaderboard')}</CardTitle>
    //                 <div className="relative w-full sm:w-64">
    //                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    //                   <Input
    //                     placeholder={t('search_placeholder')}
    //                     className="pl-9"
    //                     value={searchQuery}
    //                     onChange={(e) => setSearchQuery(e.target.value)}
    //                   />
    //                 </div>
    //               </div>
    //             </CardHeader>
    //             <CardContent>
    //               <Table>
    //                 <TableHeader>
    //                   <TableRow>
    //                     <TableHead className="w-14 text-center">{t('rank')}</TableHead>
    //                     <TableHead>{t('user')}</TableHead>
    //                     <TableHead
    //                       className="text-right cursor-pointer hover:bg-muted/50 transition-colors"
    //                       onClick={() => handleSort('totalScore')}
    //                     >
    //                       <div className="flex items-center justify-end gap-1">
    //                         {t('score')}
    //                         {getSortIcon('totalScore')}
    //                       </div>
    //                     </TableHead>
    //                     <TableHead
    //                       className="text-right hidden sm:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
    //                       onClick={() => handleSort('solvedCount')}
    //                     >
    //                       <div className="flex items-center justify-end gap-1">
    //                         {t('solved_problems')}
    //                         {getSortIcon('solvedCount')}
    //                       </div>
    //                     </TableHead>
    //                     <TableHead
    //                       className="text-right hidden md:table-cell cursor-pointer hover:bg-muted/50 transition-colors"
    //                       onClick={() => handleSort('acceptanceRate')}
    //                     >
    //                       <div className="flex items-center justify-end gap-1">
    //                         {t('acceptance')}
    //                         {getSortIcon('acceptanceRate')}
    //                       </div>
    //                     </TableHead>
    //                   </TableRow>
    //                 </TableHeader>
    //                 <TableBody>
    //                   {paginatedUsers.map((user) => (
    //                     <TableRow
    //                       key={user.id}
    //                       className="group hover:bg-muted/50 transition-colors"
    //                     >
    //                       <TableCell className="text-center font-medium">
    //                         {user.position <= 3 ? (
    //                           <div className="flex justify-center">
    //                             {user.position === 1 && (
    //                               <Trophy className="w-4 h-4 text-yellow-500 fill-current" />
    //                             )}
    //                             {user.position === 2 && (
    //                               <Medal className="w-4 h-4 text-gray-400 fill-current" />
    //                             )}
    //                             {user.position === 3 && (
    //                               <Medal className="w-4 h-4 text-orange-400 fill-current" />
    //                             )}
    //                           </div>
    //                         ) : (
    //                           <span className="text-muted-foreground text-sm">
    //                             #{user.position}
    //                           </span>
    //                         )}
    //                       </TableCell>
    //                       <TableCell>
    //                         <Link
    //                           href={`/profile/${user.id}`}
    //                           className="flex items-center gap-3 hover:opacity-80 transition-opacity"
    //                         >
    //                           <Avatar className="w-8 h-8 border border-border">
    //                             <AvatarImage src={user.avatarUrl} />
    //                             <AvatarFallback>
    //                               {user.firstName[0]}
    //                             </AvatarFallback>
    //                           </Avatar>
    //                           <div className="flex flex-col">
    //                             <span className="font-medium text-sm text-foreground">
    //                               {user.username}
    //                             </span>
    //                             <span className="text-[10px] text-muted-foreground hidden sm:inline-block">{`${user.firstName}·${user.lastName}`}</span>
    //                           </div>
    //                         </Link>
    //                       </TableCell>
    //                       <TableCell className="text-right">
    //                         <Badge
    //                           variant="secondary"
    //                           className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
    //                         >
    //                           {user.totalScore.toLocaleString()}
    //                         </Badge>
    //                       </TableCell>
    //                       <TableCell className="text-right font-medium text-muted-foreground hidden sm:table-cell">
    //                         {user.solvedCount}
    //                       </TableCell>
    //                       <TableCell className="text-right hidden md:table-cell">
    //                         <div className="flex items-center justify-end gap-2">
    //                           <span className="text-xs text-muted-foreground">
    //                             {user.acceptanceRate.toFixed(0)}%
    //                           </span>
    //                           <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
    //                             <div
    //                               className="h-full bg-blue-500 rounded-full"
    //                               style={{ width: `${user.acceptanceRate}%` }}
    //                             />
    //                           </div>
    //                         </div>
    //                       </TableCell>
    //                     </TableRow>
    //                   ))}
    //                   {paginatedUsers.length === 0 && (
    //                     <TableRow>
    //                       <TableCell
    //                         colSpan={5}
    //                         className="text-center py-8 text-muted-foreground"
    //                       >
    //                         {t('no_users_found')}
    //                       </TableCell>
    //                     </TableRow>
    //                   )}
    //                 </TableBody>
    //               </Table>

    //               {/* Pagination */}
    //               {totalPages > 1 && (
    //                 <div className="flex justify-center mt-6 gap-2">
    //                   <Button
    //                     variant="outline"
    //                     size="sm"
    //                     onClick={() =>
    //                       setCurrentPage((p) => Math.max(1, p - 1))
    //                     }
    //                     disabled={currentPage === 1}
    //                   >
    //                     {t('previous')}
    //                   </Button>
    //                   <span className="flex items-center px-4 text-sm text-foreground">
    //                     {t('page_info', { current: currentPage, total: totalPages })}
    //                   </span>
    //                   <Button
    //                     variant="outline"
    //                     size="sm"
    //                     onClick={() =>
    //                       setCurrentPage((p) => Math.min(totalPages, p + 1))
    //                     }
    //                     disabled={currentPage === totalPages}
    //                   >
    //                     {t('next')}
    //                   </Button>
    //                 </div>
    //               )}
    //             </CardContent>
    //           </Card>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
