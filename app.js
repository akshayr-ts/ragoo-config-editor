// Ragoo Pipeline Configuration Editor - Secure Version
// Enhanced security features for production use

class SecurePipelineConfigEditor {
	constructor() {
		this.githubToken = "";
		this.owner = "";
		this.repo = "";
		this.branch = "main";
		this.filePath = "pipeline-config.json";
		this.currentConfig = null;
		this.currentSha = null;
		this.sessionStartTime = Date.now();
		this.sessionDuration = 30 * 60 * 1000; // 30 minutes

		this.initializeEventListeners();
		this.setupSortable();
		this.setupSecurityFeatures();
	}

	setupSecurityFeatures() {
		// Clear data on page unload
		window.addEventListener("beforeunload", () => this.clearSecurityData());

		// Setup session timeout
		this.setupSessionTimeout();

		// Start session timer display
		this.updateSessionTimer();

		// Detect suspicious activity
		this.setupSecurityMonitoring();

		// Auto-lock on inactivity
		this.setupActivityMonitoring();
	}

	setupSecurityMonitoring() {
		// Monitor for dev tools (basic detection)
		let devtools = { open: false };
		setInterval(() => {
			if (
				window.outerHeight - window.innerHeight > 200 ||
				window.outerWidth - window.innerWidth > 200
			) {
				if (!devtools.open) {
					devtools.open = true;
					console.clear();
					console.warn(
						"🔒 Security Notice: Developer tools detected. Please close for security."
					);
				}
			} else {
				devtools.open = false;
			}
		}, 1000);

		// Disable right-click context menu
		document.addEventListener("contextmenu", (e) => {
			e.preventDefault();
			this.showNotification("Right-click disabled for security", "warning");
		});

		// Disable text selection on sensitive areas
		document.addEventListener("selectstart", (e) => {
			if (
				e.target.id === "githubToken" ||
				e.target.classList.contains("token-input")
			) {
				e.preventDefault();
			}
		});
	}

	setupActivityMonitoring() {
		let lastActivity = Date.now();
		const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

		const updateActivity = () => {
			lastActivity = Date.now();
		};

		["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach(
			(event) => {
				document.addEventListener(event, updateActivity, true);
			}
		);

		// Check for inactivity every minute
		setInterval(() => {
			if (Date.now() - lastActivity > INACTIVITY_TIMEOUT && this.githubToken) {
				this.showNotification("Session locked due to inactivity", "warning");
				this.clearSecurityData();
				this.hideEditor();
			}
		}, 60000);
	}

	setupSessionTimeout() {
		setInterval(() => {
			if (
				Date.now() - this.sessionStartTime > this.sessionDuration &&
				this.githubToken
			) {
				alert("Session expired for security. Please re-authenticate.");
				this.clearSecurityData();
				location.reload();
			}
		}, 60000); // Check every minute
	}

	updateSessionTimer() {
		const timer = setInterval(() => {
			if (!this.githubToken) {
				clearInterval(timer);
				return;
			}

			const elapsed = Date.now() - this.sessionStartTime;
			const remaining = this.sessionDuration - elapsed;

			if (remaining <= 0) {
				clearInterval(timer);
				return;
			}

			const minutes = Math.floor(remaining / 60000);
			const seconds = Math.floor((remaining % 60000) / 1000);

			const timerElement = document.getElementById("sessionTimer");
			if (timerElement) {
				timerElement.textContent = `${minutes}:${seconds
					.toString()
					.padStart(2, "0")}`;

				// Warning colors
				if (remaining < 5 * 60 * 1000) {
					// Less than 5 minutes
					timerElement.style.color = "red";
					timerElement.style.fontWeight = "bold";
				} else if (remaining < 10 * 60 * 1000) {
					// Less than 10 minutes
					timerElement.style.color = "orange";
				}
			}
		}, 1000);
	}

	clearSecurityData() {
		// Clear all sensitive data
		this.githubToken = "";
		this.owner = "";
		this.repo = "";
		this.currentConfig = null;
		this.currentSha = null;

		// Clear localStorage and sessionStorage
		localStorage.clear();
		sessionStorage.clear();

		// Clear form fields
		const fields = ["githubToken", "repoOwner", "repoName"];
		fields.forEach((id) => {
			const element = document.getElementById(id);
			if (element) element.value = "";
		});

		// Clear any temporary data
		document.getElementById("currentRepo").textContent = "Not connected";

		console.clear(); // Clear console
	}

	// Simple encryption for localStorage (basic obfuscation)
	encrypt(text) {
		return btoa(text.split("").reverse().join("") + Date.now());
	}

	decrypt(encrypted) {
		try {
			const decoded = atob(encrypted);
			const timestamp = decoded.slice(-13);
			const text = decoded.slice(0, -13);
			return text.split("").reverse().join("");
		} catch {
			return "";
		}
	}

	initializeEventListeners() {
		document
			.getElementById("loadConfig")
			.addEventListener("click", () => this.loadConfiguration());
		document
			.getElementById("addStage")
			.addEventListener("click", () => this.addNewStage());
		document
			.getElementById("saveConfig")
			.addEventListener("click", () => this.saveConfiguration());
		document.getElementById("clearSession").addEventListener("click", () => {
			if (confirm("Are you sure you want to clear all session data?")) {
				this.clearSecurityData();
				this.hideEditor();
				this.showNotification("Session cleared successfully", "success");
			}
		});

		// Load saved repository configuration
		const savedConfig = localStorage.getItem("secure_repo_config");
		if (savedConfig) {
			try {
				const { owner, repo } = JSON.parse(this.decrypt(savedConfig));
				document.getElementById("repoOwner").value = owner;
				document.getElementById("repoName").value = repo;
			} catch (error) {
				localStorage.removeItem("secure_repo_config");
			}
		}
	}

	setupSortable() {
		const container = document.getElementById("stagesContainer");
		new Sortable(container, {
			handle: ".drag-handle",
			animation: 150,
			onEnd: () => this.updatePreview(),
		});
	}

	async loadConfiguration() {
		const token = document.getElementById("githubToken").value.trim();
		const owner = document.getElementById("repoOwner").value.trim();
		const repo = document.getElementById("repoName").value.trim();

		if (!token || !owner || !repo) {
			this.showNotification("Please fill in all required fields", "error");
			return;
		}

		// Validate token format
		if (!token.startsWith("ghp_") && !token.startsWith("github_pat_")) {
			if (
				!confirm(
					'Token format seems incorrect. GitHub tokens usually start with "ghp_" or "github_pat_". Continue anyway?'
				)
			) {
				return;
			}
		}

		// Validate repository name format
		if (!/^[a-zA-Z0-9._-]+$/.test(owner) || !/^[a-zA-Z0-9._-]+$/.test(repo)) {
			this.showNotification("Invalid repository owner or name format", "error");
			return;
		}

		this.githubToken = token;
		this.owner = owner;
		this.repo = repo;
		this.sessionStartTime = Date.now(); // Reset session timer

		// Store repository config with encryption
		const repoConfig = { owner, repo };
		localStorage.setItem(
			"secure_repo_config",
			this.encrypt(JSON.stringify(repoConfig))
		);

		this.showLoading(true);

		try {
			const response = await fetch(
				`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}?ref=${this.branch}`,
				{
					headers: {
						Authorization: `token ${this.githubToken}`,
						Accept: "application/vnd.github.v3+json",
					},
				}
			);

			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Invalid GitHub token or insufficient permissions");
				} else if (response.status === 404) {
					throw new Error(
						"Repository or file not found. Check repository name and file path."
					);
				} else if (response.status === 403) {
					throw new Error("Access forbidden. Check token permissions.");
				} else {
					throw new Error(
						`GitHub API error: ${response.status} ${response.statusText}`
					);
				}
			}

			const data = await response.json();
			this.currentSha = data.sha;

			// Decode base64 content
			const content = atob(data.content);
			this.currentConfig = JSON.parse(content);

			this.renderStages();
			this.showEditor();
			this.updatePreview();

			// Update UI with connection info
			document.getElementById("currentRepo").textContent = `${owner}/${repo}`;

			this.showNotification("Configuration loaded successfully!", "success");
		} catch (error) {
			console.error("Error loading configuration:", error);
			this.showNotification(`Failed to load: ${error.message}`, "error");

			// Clear potentially invalid data
			if (error.message.includes("Invalid GitHub token")) {
				this.clearSecurityData();
			}
		} finally {
			this.showLoading(false);
		}
	}

	renderStages() {
		const container = document.getElementById("stagesContainer");
		container.innerHTML = "";

		this.currentConfig.pipeline.stages.forEach((stage) => {
			const stageElement = this.createStageElement(stage);
			container.appendChild(stageElement);
		});
	}

	createStageElement(stage = null) {
		const template = document.getElementById("stageTemplate");
		const stageElement = template.content.cloneNode(true);

		if (stage) {
			stageElement.querySelector(".stage-label").value = stage.label || "";
			stageElement.querySelector(".stage-value").value = stage.value || "";
			stageElement.querySelector(".stage-badge").value = stage.badgeClass || "";
			stageElement.querySelector(".stage-background").value =
				stage.background || "#6b7280";
		}

		// Setup event listeners for this stage
		const stageDiv = stageElement.querySelector(".stage-card");

		// Color picker events
		stageElement.querySelectorAll(".color-option").forEach((colorOption) => {
			colorOption.addEventListener("click", (e) => {
				const color = e.target.dataset.color;
				const backgroundInput = stageDiv.querySelector(".stage-background");
				backgroundInput.value = color;
				this.updateStagePreview(stageDiv);
				this.updatePreview();
			});
		});

		// Input change events
		stageElement.querySelectorAll("input").forEach((input) => {
			input.addEventListener("input", () => {
				this.updateStagePreview(stageDiv);
				this.updatePreview();
			});
		});

		// Delete button
		stageElement
			.querySelector(".delete-stage")
			.addEventListener("click", () => {
				if (confirm("Are you sure you want to delete this stage?")) {
					stageDiv.remove();
					this.updatePreview();
				}
			});

		// Initial preview update
		setTimeout(() => this.updateStagePreview(stageDiv), 100);

		return stageElement;
	}

	updateStagePreview(stageDiv) {
		const label = stageDiv.querySelector(".stage-label").value || "Preview";
		const background =
			stageDiv.querySelector(".stage-background").value || "#6b7280";
		const preview = stageDiv.querySelector(".stage-preview");

		preview.textContent = label;
		preview.style.backgroundColor = background;
		preview.style.color = this.getContrastColor(background);
	}

	getContrastColor(hexColor) {
		const r = parseInt(hexColor.slice(1, 3), 16);
		const g = parseInt(hexColor.slice(3, 5), 16);
		const b = parseInt(hexColor.slice(5, 7), 16);
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
		return luminance > 0.5 ? "#000000" : "#ffffff";
	}

	addNewStage() {
		const container = document.getElementById("stagesContainer");
		const newStage = this.createStageElement();
		container.appendChild(newStage);

		newStage.querySelector(".stage-card").scrollIntoView({
			behavior: "smooth",
			block: "center",
		});

		setTimeout(() => {
			newStage.querySelector(".stage-label").focus();
		}, 300);
	}

	updatePreview() {
		const stages = this.collectStagesData();
		const previewContainer = document.getElementById("previewContainer");

		previewContainer.innerHTML = "<h6>Dropdown Preview:</h6>";
		const dropdown = document.createElement("select");
		dropdown.className = "form-select";
		dropdown.style.maxWidth = "300px";

		const defaultOption = document.createElement("option");
		defaultOption.textContent = "Current: NA";
		defaultOption.disabled = true;
		dropdown.appendChild(defaultOption);

		stages.forEach((stage) => {
			const option = document.createElement("option");
			option.value = stage.value;
			option.textContent = stage.label;
			option.style.backgroundColor = stage.background;
			option.style.color = this.getContrastColor(stage.background);
			dropdown.appendChild(option);
		});

		previewContainer.appendChild(dropdown);

		const badgesDiv = document.createElement("div");
		badgesDiv.innerHTML = '<h6 class="mt-3">Badges Preview:</h6>';
		stages.forEach((stage) => {
			const badge = document.createElement("span");
			badge.className = `badge me-2 ${stage.badgeClass}`;
			badge.style.backgroundColor = stage.background;
			badge.style.color = this.getContrastColor(stage.background);
			badge.textContent = stage.label;
			badgesDiv.appendChild(badge);
		});
		previewContainer.appendChild(badgesDiv);
	}

	collectStagesData() {
		const stages = [];
		const stageCards = document.querySelectorAll(".stage-card");

		stageCards.forEach((card) => {
			const label = card.querySelector(".stage-label").value.trim();
			const value = card.querySelector(".stage-value").value.trim();
			const badgeClass = card.querySelector(".stage-badge").value.trim();
			const background = card.querySelector(".stage-background").value;

			if (label && value) {
				stages.push({
					label,
					value,
					badgeClass: badgeClass || "badge-secondary",
					background,
				});
			}
		});

		return stages;
	}

	async saveConfiguration() {
		if (
			!confirm(
				"Are you sure you want to save these changes? This will update the live configuration."
			)
		) {
			return;
		}

		this.showLoading(true);

		try {
			const stages = this.collectStagesData();

			if (stages.length === 0) {
				this.showNotification(
					"Please add at least one stage before saving",
					"error"
				);
				return;
			}

			const updatedConfig = {
				...this.currentConfig,
				pipeline: {
					...this.currentConfig.pipeline,
					stages: stages,
				},
			};

			const content = btoa(JSON.stringify(updatedConfig, null, 2));

			const response = await fetch(
				`https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.filePath}`,
				{
					method: "PUT",
					headers: {
						Authorization: `token ${this.githubToken}`,
						Accept: "application/vnd.github.v3+json",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						message: `Update pipeline configuration - ${new Date().toISOString()}`,
						content: content,
						sha: this.currentSha,
						branch: this.branch,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(
					`GitHub API error: ${response.status} ${response.statusText}`
				);
			}

			const result = await response.json();
			this.currentSha = result.content.sha;
			this.currentConfig = updatedConfig;

			this.showNotification(
				"Configuration saved successfully! Changes will be live within a few minutes.",
				"success"
			);
		} catch (error) {
			console.error("Error saving configuration:", error);
			this.showNotification(`Failed to save: ${error.message}`, "error");
		} finally {
			this.showLoading(false);
		}
	}

	showEditor() {
		document.getElementById("authSection").style.display = "none";
		document.getElementById("editorSection").style.display = "block";
	}

	hideEditor() {
		document.getElementById("authSection").style.display = "block";
		document.getElementById("editorSection").style.display = "none";
	}

	showLoading(show) {
		document.getElementById("loadingOverlay").style.display = show
			? "flex"
			: "none";
	}

	showNotification(message, type = "info") {
		const alertType = type === "error" ? "danger" : type;
		const icon =
			type === "success"
				? "check-circle"
				: type === "error"
				? "exclamation-circle"
				: "info-circle";

		const notification = document.createElement("div");
		notification.className = `alert alert-${alertType} position-fixed`;
		notification.style =
			"top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;";
		notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${icon} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
		document.body.appendChild(notification);

		setTimeout(() => {
			if (notification.parentElement) {
				notification.remove();
			}
		}, 5000);
	}
}

// Initialize the secure editor when the page loads
document.addEventListener("DOMContentLoaded", () => {
	new SecurePipelineConfigEditor();
});

// Enhanced security: Clear everything on page unload
window.addEventListener("beforeunload", () => {
	localStorage.clear();
	sessionStorage.clear();
});
