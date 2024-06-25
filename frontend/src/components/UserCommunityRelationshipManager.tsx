import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Community, ResponseError, User } from '../interfaces';
import './UserCommunityRelationshipManager.css';
import { toast } from 'react-hot-toast';
import { formatNumber } from '../utils/number-format';

interface MutationData {
  userId: string;
  communityId: string;
}

enum QueryKeys {
  USERS = 'users',
  COMMUNITIES = 'communities',
}

const UserCommunityRelationshipManager = () => {
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: [QueryKeys.USERS],
    queryFn: () => axios.get<User[]>('http://localhost:8080/user').then(res => res.data),
  });

  const { data: communities, isLoading: communitiesLoading } = useQuery({
    queryKey: [QueryKeys.COMMUNITIES],
    queryFn: () => axios.get<Community[]>('http://localhost:8080/community').then(res => res.data),
  });

  const joinMutation = useMutation({
    mutationFn: (data: MutationData) => axios.post(`http://localhost:8080/user/${data.userId}/join/${data.communityId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.COMMUNITIES] });

      toast.success('Successfully joined the community');
    },
    onError: (error: ResponseError) => {
      const message = error.response?.data.message ??
        "An unknown error has occured. Please try again later.";
      toast.error(`Error: ${message}`);
    },
  });
  const leaveMutation = useMutation({
    mutationFn: (data: MutationData) => axios.delete(`http://localhost:8080/user/${data.userId}/leave/${data.communityId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.USERS] });
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.COMMUNITIES] });

      toast.success('Successfully left the community');
    },
    onError: (error: ResponseError) => {
      const message = error.response?.data.message ?? "An unknown error has occured. Please try again later.";
      toast.error(`Error: ${message}`);
    },
  });

  const handleJoinClick = () => {
    if (selectedUser && selectedCommunity) {
      joinMutation.mutate({ userId: selectedUser, communityId: selectedCommunity });
    }
  };

  const handleLeaveClick = () => {
    if (selectedUser && selectedCommunity) {
      leaveMutation.mutate({ userId: selectedUser, communityId: selectedCommunity });
    }
  };

  if (usersLoading || communitiesLoading) return 'Loading...';

  return (
    <div>
      <label>
        User: &nbsp;
        {!!users?.length && (
          <select onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">Select User</option>
            {users.map((user: User) => <option key={user._id} value={user._id}>{user.email}</option>)}
          </select>
        )}
      </label>

      <label>
        Community: &nbsp;
        {!!communities?.length && (
          <select onChange={(e) => setSelectedCommunity(e.target.value)}>
            <option value="">Select Community</option>
            {communities.map((community: Community) => <option key={community._id} value={community._id}>{community.name}</option>)}
          </select>
        )}
      </label>


      <button
        className="join-button"
        onClick={handleJoinClick}
        disabled={!selectedUser || !selectedCommunity}
      >
        Join
      </button>

      <button
        className="leave-button"
        onClick={handleLeaveClick}
        disabled={!selectedUser || !selectedCommunity}
      >
        Leave
      </button>

      <div className="community-leaderboard">
        <h2 className="community-leaderboard__heading">Top Community Leaderboard</h2>

        <div className="community-leaderboard-labels-container">
          <div className="community-leaderboard-labels">
            <span className="community-leaderboard-labels__rank">Rank</span>
            <span className="community-leaderboard-labels__comunity">Community</span>
            <span className="community-leaderboard-labels__exp">EXP</span>
            <span className="community-leaderboard-labels__users">Users</span>
          </div>

          <div className="community-leaderboard-labels">
            <span className="community-leaderboard-labels__rank">Rank</span>
            <span className="community-leaderboard-labels__comunity">Community</span>
            <span className="community-leaderboard-labels__exp">EXP</span>
            <span className="community-leaderboard-labels__users">Users</span>
          </div>
        </div>

        {!!communities?.length && (
          <ul className="community-leaderboard__list">
            {communities.map((community, index) => {
              const [firstName, secondName] = community.name.split(' ');
              const firstLetter = firstName.charAt(0);
              const secondLetter = secondName.charAt(0);
              const fallbackName = secondLetter ? `${firstLetter}${secondLetter}` : firstLetter

              return (
                <li key={community._id} className="community-leaderboard__community">
                  <span className="community-leaderboard__rank">{index + 1}</span>

                  <div className="community-logo__container">
                    {community.name ? (
                      <img className="community-logo" src={community.logo} alt={`${community.name}'s logo`} />
                    ) : (
                      <span className="community-logo community-logo--fallback">
                        {fallbackName}
                      </span>
                    )}
                  </div>

                  <span>{community.name}</span>
                  <span className="community-leaderboard__exp">
                    {formatNumber(community.totalCommunityPoints ?? 0)}
                  </span>
                  <span>{community.totalUsers ?? 0}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserCommunityRelationshipManager;