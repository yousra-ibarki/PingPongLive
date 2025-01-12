async def end_match(self, match_id: str, winner_id: int, leaver: bool):
    try:
        tournament_id = self.get_tournament_id_from_room(match_id)
        if not tournament_id or tournament_id not in self.tournament_brackets:
            print(f"[end_match] Invalid tournament/match ID: {match_id}")
            return

        bracket = self.tournament_brackets[tournament_id]
        match_parts = match_id.split('_')
        match_suffix = match_parts[-1]
        channel_layer = get_channel_layer()

        winner_info = await self.get_player_info(winner_id)
        if not winner_info:
            print(f"[end_match] Winner info not found for ID: {winner_id}")
            return

        if match_suffix == "final":
            print("[end_match] Processing final match")
            final_match = bracket['final_match']
            final_loser = next((p for p in final_match['players'] if p['id'] != winner_id), None)

            if final_loser:
                async with self.lock:
                    print(f"[end_match] Adding player {final_loser['id']} to eliminated_players [[11]]")
                    self.eliminated_players.add(final_loser['id'])
                    await self.handle_pre_match_leave(match_id, final_loser['id'])

            bracket['final_match']['winner'] = winner_id

            await channel_layer.send(
                winner_info['channel_name'],
                {
                    'type': 'tournament_update',
                    'status': 'tournament_winner',
                    'message': 'Congratulations! You won the tournament!',
                    'bracket': bracket,
                    'should_redirect': True
                }
            )

            await self.tournament_end(tournament_id)

        else:
            print("[end_match] Processing semifinal match")
            match = next((m for m in bracket['matches'] if m['match_id'].endswith(match_suffix)), None)
            if match:
                loser = next((p for p in match['players'] if p['id'] != winner_id), None)
                if loser:
                    async with self.lock:
                        print(f"[end_match] Adding player {loser['id']} to eliminated_players [[22]]")
                        self.eliminated_players.add(loser['id'])
                        await self.handle_pre_match_leave(match_id, loser['id'])

                match['winner'] = winner_id

                if all(m['winner'] is not None for m in bracket['matches']):
                    print("[end_match] All semifinals complete")
                    await self.advance_to_finals(tournament_id)
                else:
                    print("[end_match] Waiting for other semifinal")
                    winner_player = next((player for player in match['players'] if player['id'] == match['winner']), None)
                    if winner_player:
                        player_info = await self.get_player_info(winner_player['id'])
                        if player_info:
                            await channel_layer.send(
                                player_info['channel_name'],
                                {
                                    'type': 'tournament_update',
                                    'status': 'waiting_for_semifinal',
                                    'message': 'Waiting for other semifinal...',
                                    'bracket': bracket,
                                    'winner_id': winner_id,
                                    'winner_name': winner_info['name'],
                                    'winner_img': winner_info['img']
                                }
                            )

                # Notify winners when the first round finishes
                if 'round' in bracket and bracket['round'] == 1:
                    if all(m['winner'] is not None for m in bracket['matches']):
                        all_winners = [m['winner'] for m in bracket['matches']]
                        for winner_id in all_winners:
                            winner_info = await self.get_player_info(winner_id)
                            if winner_info:
                                opponent = next(
                                    (p for p in all_winners if p != winner_id),
                                    None
                                )
                                if opponent:
                                    opponent_info = await self.get_player_info(opponent)
                                    if opponent_info:
                                        notification_message = (
                                            f"The first round has finished. Get ready for the next round!\n"
                                            f"Your next opponent is {opponent_info['name']}."
                                        )
                                        user = await self.get_user_async(winner_id)
                                        if user and user.username:
                                            await self.send_chat_notification(user.username, notification_message)

            else:
                print(f"[end_match] Match not found with suffix {match_suffix}")

    except Exception as e:
        print(f"[end_match] Error: {str(e)}")
        if winner_info and winner_info.get('channel_name'):
            await channel_layer.send(
                winner_info['channel_name'],
                {
                    'type': 'tournament_error',
                    'message': 'Error processing match end.'
                }
            )