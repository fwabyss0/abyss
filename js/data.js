/**
 * Central Data Source Adapter
 * Bridges legacy imports and exports to the Single Central Configuration in ./config.js
 */

import { PORTFOLIO_CONFIG } from './config.js';

export { PORTFOLIO_CONFIG };

export const PROFILE = {
  name: PORTFOLIO_CONFIG.player.name,
  preferredName: PORTFOLIO_CONFIG.player.alias,
  eyebrow: PORTFOLIO_CONFIG.player.edition,
  tagline: PORTFOLIO_CONFIG.screens[0].description,
  availability: PORTFOLIO_CONFIG.player.availability,
  website: PORTFOLIO_CONFIG.player.website,
  email: PORTFOLIO_CONFIG.player.email,
  phone: PORTFOLIO_CONFIG.player.phone,
  phoneFormatted: PORTFOLIO_CONFIG.player.phone,
  location: PORTFOLIO_CONFIG.player.location,
  education: PORTFOLIO_CONFIG.player.education,
  portraitImage: PORTFOLIO_CONFIG.player.portraitImage,
  portraitFallback: PORTFOLIO_CONFIG.player.portraitFallback,
  portraitAlt: `${PORTFOLIO_CONFIG.player.name} (${PORTFOLIO_CONFIG.player.alias}) — Interactive Portrait`
};

export const SOCIALS = PORTFOLIO_CONFIG.socials;
export const NAV_LINKS = PORTFOLIO_CONFIG.screens.map(s => ({
  label: s.label,
  href: `#${s.id}`,
  slot: s.slot,
  tooltip: s.tooltip,
  hotbarIcon: s.hotbarIcon
}));

export const PROJECTS = PORTFOLIO_CONFIG.projects;
export const SKILL_CATEGORIES = PORTFOLIO_CONFIG.skillCategories;
export const CRAFTING_RECIPES = PORTFOLIO_CONFIG.craftingRecipes;
export const ACHIEVEMENTS = PORTFOLIO_CONFIG.advancements;
export const SERVICES = PORTFOLIO_CONFIG.services;
export const WRITTEN_BOOK = PORTFOLIO_CONFIG.writtenBook;
export const MINING_ORES = PORTFOLIO_CONFIG.miningMinigame.ores;

export const MILESTONES = PORTFOLIO_CONFIG.craftingRecipes.map(cr => ({
  role: cr.result.title,
  organization: cr.result.subtitle,
  period: cr.result.period,
  location: cr.result.location,
  details: cr.result.description
}));
