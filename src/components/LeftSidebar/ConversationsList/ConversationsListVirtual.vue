<!--
  - SPDX-FileCopyrightText: 2023 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import type { Conversation, ConversationTag } from '../../../types/index.ts'
import type { TagHeaderItem } from './ConversationTagHeader.vue'

import { useVirtualList } from '@vueuse/core'
import { computed, toRef } from 'vue'
import LoadingPlaceholder from '../../UIShared/LoadingPlaceholder.vue'
import ConversationItem from './ConversationItem.vue'
import ConversationTagHeader from './ConversationTagHeader.vue'
import { AVATAR } from '../../../constants.ts'
import { useConversationTagsStore } from '../../../stores/conversationTags.ts'

export type VirtualListItem = (Conversation | TagHeaderItem) & { _key?: string }

const props = defineProps<{
	conversations: Conversation[]
	loading?: boolean
	compact?: boolean
	/**
	 * When true, conversations are split into tag sections defined by the server.
	 * Requires hasCustomTags to be true; otherwise renders a plain list.
	 */
	showTags?: boolean
}>()

const tagsStore = useConversationTagsStore()

/**
 * Type guard to check if a list item is a tag header
 *
 * @param item The list item to check
 */
function isTagHeader(item: VirtualListItem): item is TagHeaderItem {
	return '_type' in item && item._type === 'tag-header'
}

/**
 * Build the flat list that is fed to the virtual scroller.
 * When showTags is true and custom tags exist, conversations are interspersed
 * with tag-header sentinel items so the virtual list can render section headers.
 */
const listItems = computed<VirtualListItem[]>(() => {
	if (!props.showTags || !tagsStore.hasCustomTags) {
		return props.conversations
	}

	const groupedConversations = props.conversations.reduce<{
		hasTagged: boolean
		favorites: Conversation[]
		favoritesUnreadCount: number
		tagged: Record<string, Conversation[]>
		taggedUnreadCount: Record<string, number>
		other: Conversation[]
		otherUnreadCount: number
	}>((acc, conversation) => {
		const unreadCount = conversation.unreadMessages || 0
		const isTagged = !!conversation.tagIds?.length

		if (conversation.isFavorite) {
			acc.favorites.push(conversation)
			acc.favoritesUnreadCount += unreadCount
		} else if (!isTagged) {
			acc.other.push(conversation)
			acc.otherUnreadCount += unreadCount
		}

		if (isTagged) {
			acc.hasTagged = true
		} else {
			return acc
		}

		for (const tagId of conversation.tagIds) {
			acc.tagged[tagId] ??= []
			acc.tagged[tagId].push(conversation)
			acc.taggedUnreadCount[tagId] = (acc.taggedUnreadCount[tagId] || 0) + unreadCount
		}
		return acc
	}, {
		hasTagged: false,
		favorites: [],
		favoritesUnreadCount: 0,
		tagged: {},
		taggedUnreadCount: {},
		other: [],
		otherUnreadCount: 0,
	})

	if (!groupedConversations.hasTagged) {
		return props.conversations
	}

	const sections = tagsStore.sortedTags.reduce<Array<{
		tag: ConversationTag
		conversations: Conversation[]
		unreadCount: number
	}>>((acc, tag) => {
		const conversations = tag.type === 'favorites'
			? groupedConversations.favorites
			: tag.type === 'other'
				? groupedConversations.other
				: (groupedConversations.tagged[tag.id] ?? [])

		if (conversations.length === 0) {
			return acc
		}

		const unreadCount = tag.type === 'favorites'
			? groupedConversations.favoritesUnreadCount
			: tag.type === 'other'
				? groupedConversations.otherUnreadCount
				: (groupedConversations.taggedUnreadCount[tag.id] ?? 0)

		acc.push({
			tag,
			conversations,
			unreadCount,
		})
		return acc
	}, [])

	return sections.reduce<VirtualListItem[]>((acc, section, index, renderedSections) => {
		const header: TagHeaderItem = {
			...section.tag,
			_type: 'tag-header',
			unreadCount: section.unreadCount,
			isFirst: index === 0,
			isLast: index === renderedSections.length - 1,
		}

		acc.push(header)
		if (section.tag.collapsed) {
			return acc
		}

		acc.push(...section.conversations.map((conversation) => ({ ...conversation, _key: `${section.tag.id}:${conversation.token}` })))
		return acc
	}, [])
})

/**
 * Consider:
 * avatar size (and two lines of text) or compact mode (28px)
 * list-item padding
 * list-item__wrapper padding
 */
const itemHeight = computed(() => props.compact ? 28 + 2 * 2 : AVATAR.SIZE.DEFAULT + 2 * 4 + 2 * 2)

const { list, containerProps, wrapperProps } = useVirtualList<VirtualListItem>(listItems, {
	itemHeight: () => itemHeight.value,
	overscan: 10,
})

/**
 * Get an index of the first fully visible conversation in viewport
 * Math.ceil to include partially of (absolute number of items above viewport) + 1 (next item is in viewport) - 1 (index starts from 0)
 */
function getFirstItemInViewportIndex(): number {
	return Math.ceil(containerProps.ref.value!.scrollTop / itemHeight.value)
}

/**
 * Get an index of the last fully visible conversation in viewport
 * Math.floor to include only fully visible of (absolute number of items below and in viewport) - 1 (index starts from 0)
 */
function getLastItemInViewportIndex(): number {
	return Math.floor((containerProps.ref.value!.scrollTop + containerProps.ref.value!.clientHeight) / itemHeight.value) - 1
}

/**
 * Scroll to conversation by index
 *
 * @param index - index of conversation to scroll to
 */
function scrollToItem(index: number) {
	const firstItemIndex = getFirstItemInViewportIndex()
	const lastItemIndex = getLastItemInViewportIndex()

	const viewportHeight = containerProps.ref.value!.clientHeight

	/**
	 * Scroll to a position with smooth scroll imitation
	 *
	 * @param to - target position (in px)
	 */
	const doScroll = (to: number) => {
		const ITEMS_TO_BORDER_AFTER_SCROLL = 1
		const padding = ITEMS_TO_BORDER_AFTER_SCROLL * itemHeight.value
		const from = containerProps.ref.value!.scrollTop
		const direction = from < to ? 1 : -1

		// If we are far from the target - instantly scroll to a close position
		if (Math.abs(from - to) > viewportHeight) {
			containerProps.ref.value!.scrollTo({
				top: to - direction * viewportHeight,
				behavior: 'instant',
			})
		}

		// Scroll to the target with smooth scroll
		containerProps.ref.value!.scrollTo({
			top: to + padding * direction,
			behavior: 'smooth',
		})
	}

	if (index < firstItemIndex) { // Item is above
		doScroll(index * itemHeight.value)
	} else if (index > lastItemIndex) { // Item is below
		// Position of item + item's height and move to bottom
		doScroll((index + 1) * itemHeight.value - viewportHeight)
	}
}

/**
 * Scroll to conversation by token
 *
 * @param token - token of conversation to scroll to
 */
function scrollToConversation(token: string) {
	const index = listItems.value.findIndex((item) => !isTagHeader(item) && item.token === token)
	if (index !== -1) {
		scrollToItem(index)
	}
}

defineExpose({
	getFirstItemInViewportIndex,
	getLastItemInViewportIndex,
	scrollToItem,
	scrollToConversation,
})
</script>

<template>
	<li
		:ref="containerProps.ref"
		:style="containerProps.style"
		@scroll="containerProps.onScroll">
		<LoadingPlaceholder v-if="loading" type="conversations" />
		<ul
			v-else
			:style="wrapperProps.style">
			<template v-for="item in list" :key="item.data._key ?? item.data.id">
				<ConversationTagHeader
					v-if="isTagHeader(item.data)"
					:item="item.data as TagHeaderItem" />
				<ConversationItem
					v-else
					:item="item.data as Conversation"
					:compact />
			</template>
		</ul>
	</li>
</template>

<style lang="scss" scoped>
// Overwrite NcListItem styles
// TOREMOVE: get rid of it or find better approach
:deep(.list-item) {
	outline-offset: -2px;
}

/* Overwrite NcListItem styles for compact view */
:deep(.list-item--compact) {
	padding-block: 0 !important;
}

:deep(.list-item--compact:not(:has(.list-item-content__subname))) {
	--list-item-height: calc(var(--clickable-area-small, 24px) + 4px) !important;
}

:deep(.list-item--compact .button-vue--size-normal) {
	--button-size: var(--clickable-area-small, 24px);
	--button-radius: var(--border-radius);
}

:deep(.list-item--compact .list-item-content__actions) {
	height: var(--clickable-area-small, 24px);
}
</style>
