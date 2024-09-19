/**
 * SPDX-FileCopyrightText: 2020 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useSoundsStore } from '../stores/sounds.js'

export const Sounds = {
	BLOCK_SOUND_TIMEOUT: 3000,

	isInCall: false,
	lastPlayedJoin: 0,
	lastPlayedLeave: 0,
	playedWaiting: 0,
	backgroundInterval: null,

	_stopWaiting() {
		console.debug('Stop waiting sound')
		const soundsStore = useSoundsStore()
		soundsStore.pauseWaitAudio()
		clearInterval(this.backgroundInterval)
	},

	async playWaiting() {
		const soundsStore = useSoundsStore()
		if (!soundsStore.playSounds) {
			return
		}

		console.debug('Playing waiting sound')
		soundsStore.playWaitAudio()

		this.playedWaiting = 0
		this.backgroundInterval = setInterval(() => {
			if (!soundsStore.playSounds) {
				this._stopWaiting()
				return
			}

			if (this.playedWaiting >= 3) {
				// Played 3 times, so we stop now.
				this._stopWaiting()
				return
			}

			console.debug('Playing waiting sound')
			soundsStore.playWaitAudio()
			this.playedWaiting++

		}, 15000)
	},

	async playJoin(force, playWaitingSound) {
		this._stopWaiting()

		const soundsStore = useSoundsStore()
		if (!soundsStore.playSounds) {
			return
		}

		if (force) {
			this.isInCall = true
		} else if (!this.isInCall) {
			return
		}

		const currentTime = (new Date()).getTime()
		if (!force && this.lastPlayedJoin >= (currentTime - this.BLOCK_SOUND_TIMEOUT)) {
			if (this.lastPlayedJoin >= (currentTime - this.BLOCK_SOUND_TIMEOUT)) {
				console.debug('Skipping join sound because it was played %.2f seconds ago', currentTime - this.lastPlayedJoin)
			}
			return
		}

		if (force) {
			console.debug('Playing join sound because of self joining')
		} else {
			this.lastPlayedJoin = currentTime
			console.debug('Playing join sound')
		}

		if (playWaitingSound) {
			await this.playWaiting()
		} else {
			soundsStore.playJoinAudio()
		}
	},

	async playLeave(force, playWaitingSound) {
		this._stopWaiting()

		const soundsStore = useSoundsStore()
		if (!soundsStore.playSounds) {
			return
		}

		if (!this.isInCall) {
			return
		}

		const currentTime = (new Date()).getTime()
		if (!force && this.lastPlayedLeave >= (currentTime - this.BLOCK_SOUND_TIMEOUT)) {
			if (this.lastPlayedLeave >= (currentTime - this.BLOCK_SOUND_TIMEOUT)) {
				console.debug('Skipping leave sound because it was played %f.2 seconds ago', currentTime - this.lastPlayedLeave)
			}
			return
		}

		if (force) {
			console.debug('Playing leave sound because of self leaving')
			this.isInCall = false
		} else {
			console.debug('Playing leave sound')
		}
		this.lastPlayedLeave = currentTime

		soundsStore.playLeaveAudio()

		if (playWaitingSound) {
			this.playWaiting()
		}
	},
}
