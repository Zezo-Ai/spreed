<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<!-- eslint-disable vue/singleline-html-element-content-newline -->
<template>
	<NcNoteCard type="info" class="absence-reminder">
		<template #icon>
			<AvatarWrapper :id="userAbsence.userId"
				:token="token"
				:name="displayName"
				source="users"
				:size="AVATAR.SIZE.SMALL"
				disable-menu
				disable-tooltip />
		</template>
		<p class="absence-reminder__caption">{{ userAbsenceCaption }}</p>
		<p v-if="userAbsencePeriod">{{ userAbsencePeriod }}</p>
		<div v-if="userAbsence.replacementUserId" class="absence-reminder__replacement">
			<!-- TRANSLATORS An acting person during the period of absence of the main contact -->
			<p>{{ t('spreed', 'Replacement:') }}</p>
			<NcUserBubble :key="isDarkTheme ? 'dark' : 'light'"
				class="absence-reminder__replacement__bubble"
				:title="t('spreed', 'Open conversation')"
				:display-name="userAbsence.replacementUserDisplayName"
				:user="userAbsence.replacementUserId"
				@click="openConversationWithReplacementUser" />
		</div>
		<NcButton v-if="userAbsenceMessage && isTextMoreThanOneLine"
			class="absence-reminder__button"
			variant="tertiary"
			:title="!collapsed ? t('spreed', 'Collapse') : t('spreed', 'Expand')"
			:aria-label="!collapsed ? t('spreed', 'Collapse') : t('spreed', 'Expand')"
			@click="toggleCollapsed">
			<template #icon>
				<IconChevronUp class="icon" :class="{ 'icon--reverted': !collapsed }" :size="20" />
			</template>
		</NcButton>
		<p ref="absenceMessage" class="absence-reminder__message" :class="{ 'absence-reminder__message--collapsed': collapsed }">{{ userAbsenceMessage }}</p>
	</NcNoteCard>
</template>

<script>
import { getCurrentUser } from '@nextcloud/auth'
import { t } from '@nextcloud/l10n'
import moment from '@nextcloud/moment'
import { useIsDarkTheme } from '@nextcloud/vue/composables/useIsDarkTheme'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcNoteCard from '@nextcloud/vue/components/NcNoteCard'
import NcUserBubble from '@nextcloud/vue/components/NcUserBubble'
import IconChevronUp from 'vue-material-design-icons/ChevronUp.vue'
import AvatarWrapper from '../AvatarWrapper/AvatarWrapper.vue'
import { useGetToken } from '../../composables/useGetToken.ts'
import { AVATAR } from '../../constants.ts'

export default {
	name: 'NewMessageAbsenceInfo',

	components: {
		AvatarWrapper,
		IconChevronUp,
		NcButton,
		NcNoteCard,
		NcUserBubble,
	},

	props: {
		userAbsence: {
			type: Object,
			required: true,
		},

		displayName: {
			type: String,
			required: true,
		},
	},

	setup() {
		const isDarkTheme = useIsDarkTheme()
		return {
			AVATAR,
			isDarkTheme,
			token: useGetToken(),
		}
	},

	data() {
		return {
			collapsed: true,
			isTextMoreThanOneLine: false,
			resizeObserver: null,
		}
	},

	computed: {
		userAbsenceCaption() {
			return t('spreed', '{user} is out of office and might not respond.', { user: this.displayName }, undefined, {
				escape: false,
				sanitize: false,
			})
		},

		userAbsenceMessage() {
			return this.userAbsence.message || this.userAbsence.shortMessage
		},

		userAbsencePeriod() {
			if (!this.userAbsence.startDate || !this.userAbsence.endDate) {
				return ''
			}
			return t('spreed', 'Absence period: {startDate} - {endDate}', {
				startDate: moment(this.userAbsence.startDate * 1000).format('ll'),
				endDate: moment(this.userAbsence.endDate * 1000).format('ll'),
			})
		},
	},

	mounted() {
		this.setIsTextMoreThanOneLine()
		this.resizeObserver = new ResizeObserver(this.setIsTextMoreThanOneLine)
		this.resizeObserver.observe(this.$refs.absenceMessage)
	},

	beforeUnmount() {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect()
		}
	},

	methods: {
		t,
		toggleCollapsed() {
			this.collapsed = !this.collapsed
		},

		setIsTextMoreThanOneLine() {
			if (!this.collapsed) {
				return
			}
			this.isTextMoreThanOneLine = this.$refs.absenceMessage?.scrollHeight > this.$refs.absenceMessage?.clientHeight
		},

		async openConversationWithReplacementUser() {
			if (this.userAbsence.replacementUserId === getCurrentUser().uid) {
				// Don't open a chat with one-self
				return
			}

			if (this.userAbsence.replacementUserId === this.userAbsence.userId) {
				// Don't recursively go to the current chat
				return
			}

			this.$router.push({
				name: 'root',
				query: {
					callUser: this.userAbsence.replacementUserId,
				},
			}).catch((err) => console.debug(`Error while pushing the new conversation's route: ${err}`))
		},
	},
}
</script>

<style lang="scss" scoped>
@import '../../assets/variables';

.absence-reminder {
	// Override NcNoteCard styles
	margin: 0 calc(var(--default-grid-baseline) * 4) calc(var(--default-grid-baseline) * 2) !important;
	padding: calc(var(--default-grid-baseline) * 2) !important;

	&__caption {
		font-weight: bold;
		margin-block: var(--default-grid-baseline);
		margin-inline: 0 var(--default-clickable-area);
	}

	&__replacement {
		display: flex;

		&__bubble {
			padding: 3px;
		}
	}

	&__message {
		white-space: pre-line;
		word-wrap: break-word;
		max-height: 30vh;
		overflow: auto;

		&--collapsed {
			text-overflow: ellipsis;
			overflow: hidden;
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
		}
	}

	&__button {
		position: absolute !important;
		top: 4px;
		inset-inline-end: 20px;

		& .icon {
			transition: $transition;

			&--reverted {
				transform: rotate(180deg);
			}
		}
	}
}
</style>
