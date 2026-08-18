/**
 * Sigil and Scribe - The Writer's Toolbox
 * Core Application Engine (app.js)
 * Canon Version 1.5 · Client Runtime Environment
 */

import { THEME_SPEC, TOOL_ROSTER, TROUBLESHOOT_GUIDE, MARKETING_MENU } from './catalog.js';

class ToolboxEngine {
  constructor() {
    // 1. Engine Core State Management Tracker
    this.state = {
      userAuthenticated: false,
      unlockedBadgeTypes: new Set(),
      currentTroubleshootIndex: 0,
      activeTroubleshootCategory: null,
      completedChecklistItems: new Set()
    };

    // 2. Exact Vector Target Mappings for the 15 Muffin Silhouette Star Nodes
    this.starCoordinates = [
      { id: 'welcome-star', cx: 30, cy: 40 },
      { id: 'still-here', cx: 65, cy: 25 },
      { id: 'wanderer', cx: 90, cy: 55 },
      { id: 'the-patron', cx: 120, cy: 20 },
      { id: 'wordsmith', cx: 155, cy: 45 },
      { id: 'second-eyes', cx: 195, cy: 30 },
      { id: 'turned-the-page', cx: 215, cy: 65 },
      { id: 'the-finish-line', cx: 180, cy: 90 },
      { id: 'true-north', cx: 140, cy: 85 },
      { id: 'cheerful-heart', cx: 105, cy: 100 },
      { id: 'brave-page', cx: 65, cy: 85 },
      { id: 'storytellers-voice', cx: 40, cy: 70 },
      { id: 'steady-hands', cx: 105, cy: 55 },
      { id: 'one-small-thing', cx: 145, cy: 55 },
      { id: 'today-spark-star', cx: 130, cy: 115 }
    ];
  }

  init() {
    this.renderHubShelf();
    this.setupWorkspaceListeners();
    this.renderConstellation();
  }

  // 3. Layout Card Well Canvas Builder
  renderHubShelf() {
    const toolsShelf = document.getElementById('toolsShelf');
    const modulesShelf = document.getElementById('modulesShelf');
    
    if (!toolsShelf || !modulesShelf) return;

    toolsShelf.innerHTML = '';
    modulesShelf.innerHTML = '';

    TOOL_ROSTER.forEach(item => {
      const card = document.createElement('div');
      card.className = 'tool-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      
      card.innerHTML = `
        <div class="tool-card-title" style="font-family: ${THEME_SPEC.typography.headers}">${item.name}</div>
        <div class="tool-card-bottleneck">${item.bottleneck}</div>
        <div class="tool-card-desc">${item.desc}</div>
      `;

      card.addEventListener('click', () => this.launchWorkspace(item.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.launchWorkspace(item.id);
        }
      });

      if (item.type === 'tool') {
        toolsShelf.appendChild(card);
      } else {
        modulesShelf.appendChild(card);
      }
    });

    this.populateTroubleshootDropdown();
    this.buildMarketingBuffet();
  }

  // 4. Workspace Router & Modal Management Framework
  launchWorkspace(id) {
    const wrapper = document.getElementById('workspaceWrapper');
    const tsWorkspace = document.getElementById('troubleshootWorkspace');
    const mktWorkspace = document.getElementById('marketingWorkspace');

    if (!wrapper) return;

    wrapper.style.display = 'block';
    wrapper.setAttribute('aria-hidden', 'false');

    // Scope cleanups
    if (tsWorkspace) tsWorkspace.style.display = 'none';
    if (mktWorkspace) mktWorkspace.style.display = 'none';

    if (id === 'troubleshoot-guide') {
      if (tsWorkspace) {
        tsWorkspace.style.display = 'block';
        document.getElementById('troubleshootSelect').value = '';
        document.getElementById('cardWorkflow').style.display = 'none';
        document.getElementById('troubleshootFallback').style.display = 'none';
      }
    } else if (id === 'marketing-menu') {
      if (mktWorkspace) mktWorkspace.style.display = 'block';
    } else {
      // General Sandbox Workspace Mapping Fallback
      this.triggerStarReward('wanderer');
    }
  }

  // 5. Troubleshoot Module Diagnostic Sequencing Core
  populateTroubleshootDropdown() {
    const selectNode = document.getElementById('troubleshootSelect');
    if (!selectNode) return;

    // Preserve the first disabled prompt option row
    selectNode.innerHTML = '<option value="" disabled selected>Choose an issue to troubleshoot...</option>';

    TROUBLESHOOT_GUIDE.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.title;
      selectNode.appendChild(option);
    });
  }

  setupWorkspaceListeners() {
    const selectNode = document.getElementById('troubleshootSelect');
    const btnWorked = document.getElementById('btnWorked');
    const btnNext = document.getElementById('btnNext');
    const closeBtn = document.getElementById('closeWorkspaceBtn');

    if (selectNode) {
      selectNode.addEventListener('change', (e) => {
        const category = TROUBLESHOOT_GUIDE.categories.find(c => c.id === e.target.value);
        if (category) {
          this.state.activeTroubleshootCategory = category;
          this.state.currentTroubleshootIndex = 0;
          this.showDiagnosticCard();
        }
      });
    }

    if (btnWorked) {
      btnWorked.addEventListener('click', () => {
        this.triggerStarReward('steady-hands');
        if (closeBtn) closeBtn.click();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.state.currentTroubleshootIndex++;
        if (this.state.currentTroubleshootIndex < this.state.activeTroubleshootCategory.cards.length) {
          this.showDiagnosticCard();
        } else {
          this.showTroubleshootFallback();
        }
      });
    }
  }

  showDiagnosticCard() {
    const workflow = document.getElementById('cardWorkflow');
    const textNode = document.getElementById('diagnosticText');
    const fallback = document.getElementById('troubleshootFallback');

    if (workflow && textNode && fallback) {
      workflow.style.display = 'block';
      fallback.style.display = 'none';
      textNode.textContent = this.state.activeTroubleshootCategory.cards[this.state.currentTroubleshootIndex];
    }
  }

  showTroubleshootFallback() {
    const workflow = document.getElementById('cardWorkflow');
    const fallback = document.getElementById('troubleshootFallback');
    const videoLink = document.getElementById('fallbackVideoLink');

    if (workflow && fallback && videoLink) {
      workflow.style.display = 'none';
      fallback.style.display = 'block';
      videoLink.href = `https://sigilandscribe.com{this.state.activeTroubleshootCategory.videoFallback}`;
      
      // Award badge persistence criteria safely upon reaching loop threshold boundaries
      this.triggerStarReward('steady-hands');
    }
  }

  // 6. Checklist Menu Layout Array Matrix Map Builder
  buildMarketingBuffet() {
    const buffet = document.getElementById('marketingBuffet');
    if (!buffet) return;

    buffet.innerHTML = '';

    MARKETING_MENU.forEach((cat, catIdx) => {
      const group = document.createElement('div');
      group.className = 'buffet-group';
      group.innerHTML = `<h3 style="font-family: ${THEME_SPEC.typography.headers}">${cat.category}</h3>`;

      cat.items.forEach((item, itemIdx) => {
        const itemKey = `mkt-${catIdx}-${itemIdx}`;
        const label = document.createElement('label');
        label.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = itemKey;
        checkbox.checked = this.state.completedChecklistItems.has(itemKey);

        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.state.completedChecklistItems.add(itemKey);
          } else {
            this.state.completedChecklistItems.delete(itemKey);
          }
          this.triggerStarReward('one-small-thing');
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(item));
        group.appendChild(label);
      });

      buffet.appendChild(group);
    });
  }

  // 7. True Unearned State Silhouette Constellation Logic
  renderConstellation() {
    const svg = document.getElementById('constellationSvg');
    if (!svg) return;

    svg.innerHTML = ''; // Clear execution buffers

    // Render underlying silhouette framework trace path lines only if the minimum breadth criteria is satisfied
    if (this.state.unlockedBadgeTypes.size >= 15) {
      this.drawSilhouetteSilhouetteTraces(svg);
    }

    this.starCoordinates.forEach(star => {
      const circle = document.createElementNS('http://w3.org', 'circle');
      circle.setAttribute('cx', star.cx);
      circle.setAttribute('cy', star.cy);
      
      // True Unearned State Pattern implementation: radius stays 0 (whitespace padding) unless earned
      const isEarned = this.state.unlockedBadgeTypes.has(star.id);
      circle.setAttribute('r', isEarned ? '4' : '0');
      circle.setAttribute('fill', THEME_SPEC.colors.charcoalBody);
      circle.style.transition = 'r 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
      
      svg.appendChild(circle);
    });
  }

  drawSilhouetteSilhouetteTraces(svg) {
    const lines = [
      { x1: 30, y1: 40, x2: 65, y2: 25 },
      { x1: 65, y1: 25, x2: 120, y2: 20 },
      { x1: 120, y1: 20, x2: 195, y2: 30 },
      { x1: 195, y1: 30, x2: 215, y2: 65 },
      { x1: 215, y1: 65, x2: 180, y2: 90 },
      { x1: 180, y1: 90, x2: 140, y2: 85 },
      { x1: 140, y1: 85, x2: 105, y2: 100 },
      { x1: 105, y1: 100, x2: 65, y2: 85 },
      { x1: 65, y1: 85, x2: 30, y2: 40 }
    ];

        lines.forEach(l => {
      const line = document.createElementNS('http://w3.org', 'line');
      line.setAttribute('x1', l.x1);
      line.setAttribute('y1', l.y1);
      line.setAttribute('x2', l.x2);
      line.setAttribute('y2', l.y2);
      line.setAttribute('stroke', THEME_SPEC.colors.mutedContexts);
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '3,3');
      svg.appendChild(line);
    });
  }
