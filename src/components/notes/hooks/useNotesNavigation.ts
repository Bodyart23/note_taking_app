"use client";

import { useState } from "react";

import type { NavView } from "../Sidebar";
import type { MobileScreen } from "../note-helpers";

export type NotesActiveView = NavView | "search";
export type MobileSettingsView = "menu" | "color-theme" | "password";

export function useNotesNavigation() {
  const [activeView, setActiveView] = useState<NotesActiveView>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>("list");
  const [mobileSettingsView, setMobileSettingsView] =
    useState<MobileSettingsView>("menu");

  const isMobileTagList = activeView === "tags" && mobileScreen === "tags";
  const applyTagFilter = selectedTag !== null && !isMobileTagList;

  const goToArchivedNotes = () => {
    setActiveView("archived");
    setSelectedTag(null);
    setSearchQuery("");
    setMobileScreen("list");
  };

  const goToAllNotes = () => {
    setActiveView("all");
    setSelectedTag(null);
    setSearchQuery("");
    setMobileScreen("list");
  };

  const handleBackFromTagNotes = () => {
    setSelectedTag(null);
    setMobileScreen("tags");
  };

  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
    setActiveView("tags");
    setMobileScreen("tag-notes");
    setSearchQuery("");
  };

  const handleDesktopNavigate = (view: NavView) => {
    setActiveView(view);
    setSearchQuery("");
    if (view !== "all") {
      setSelectedTag(null);
    }
  };

  const handleDesktopSelectTag = (tag: string | null) => {
    setSelectedTag(tag);
    setSearchQuery("");
    // Keep the All/Archived context so archived tags filter archived notes;
    // only leave auxiliary views (settings, search) for the tag results.
    setActiveView((current) => (current === "archived" ? current : "all"));
  };

  const handleOpenSettings = () => {
    setActiveView("settings");
  };

  const handleMobileNavigate = (view: NotesActiveView) => {
    setActiveView(view);
    setSearchQuery("");
    if (view === "tags") {
      setSelectedTag(null);
      setMobileScreen("tags");
    } else if (view === "settings") {
      setSelectedTag(null);
      setMobileScreen("settings");
      setMobileSettingsView("menu");
    } else {
      setSelectedTag(null);
      setMobileScreen("list");
    }
  };

  const handleMobileBack = () => {
    setMobileScreen(selectedTag ? "tag-notes" : "list");
  };

  const enterEditor = () => {
    setMobileScreen("editor");
  };

  const leaveEditor = () => {
    setMobileScreen(selectedTag ? "tag-notes" : "list");
  };

  const navigateForCreateNote = () => {
    setActiveView("all");
    setSelectedTag(null);
    setMobileScreen("editor");
  };

  const listTitle =
    applyTagFilter && selectedTag
      ? activeView === "archived"
        ? `Archived Notes Tagged: ${selectedTag}`
        : `Notes Tagged: ${selectedTag}`
      : activeView === "archived"
        ? "Archived Notes"
        : "All Notes";

  const listSubtitle =
    applyTagFilter && selectedTag
      ? activeView === "archived"
        ? `All archived notes with the '${selectedTag}' tag are shown here.`
        : `All notes with the '${selectedTag}' tag are shown here.`
      : undefined;

  const showMobileSearch = activeView === "search" && mobileScreen === "list";

  return {
    activeView,
    selectedTag,
    searchQuery,
    setSearchQuery,
    mobileScreen,
    mobileSettingsView,
    setMobileSettingsView,
    applyTagFilter,
    listTitle,
    listSubtitle,
    showMobileSearch,
    goToAllNotes,
    goToArchivedNotes,
    handleBackFromTagNotes,
    handleSelectTag,
    handleDesktopNavigate,
    handleDesktopSelectTag,
    handleOpenSettings,
    handleMobileNavigate,
    handleMobileBack,
    enterEditor,
    leaveEditor,
    navigateForCreateNote,
  };
}
