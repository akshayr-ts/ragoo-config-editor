# Ragoo Pipeline Configuration Editor

A web-based interface for managing Zoho Recruit pipeline configurations without editing JSON files directly.

## 🚀 Quick Setup

### Option 1: GitHub Pages (Recommended)

1. **Upload to GitHub Pages**:

   - Create a new repository (e.g., `ragoo-config-editor`)
   - Upload `index.html` and `app.js` files
   - Enable GitHub Pages in repository settings
   - Access via: `https://[username].github.io/ragoo-config-editor`

2. **GitHub Token Setup**:

   - Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (Full control of private repositories)
   - Copy the token (save it securely!)

3. **Usage**:
   - Open the GitHub Pages URL
   - Enter your GitHub token
   - Click "Load Configuration"
   - Edit stages using the interface
   - Save changes directly to GitHub

### Option 2: Local Development

```bash
# Serve locally
npx http-server . -p 8080
# or
python -m http.server 8080
```

## 🎯 Features

### ✅ **Visual Stage Management**

- **Drag & Drop**: Reorder stages by dragging
- **Live Preview**: See changes instantly
- **Color Picker**: Choose from predefined colors or custom colors
- **Badge Preview**: See how stages will look in dropdowns

### ✅ **GitHub Integration**

- **Direct Save**: Updates JSON file on GitHub automatically
- **Version Control**: All changes are tracked with timestamps
- **Authentication**: Secure token-based access

### ✅ **User-Friendly Interface**

- **No JSON Knowledge**: Managers can edit without technical skills
- **Validation**: Prevents saving invalid configurations
- **Responsive**: Works on desktop and mobile devices

## 🔧 Configuration Structure

The editor manages this JSON structure:

```json
{
	"pipeline": {
		"stages": [
			{
				"label": "Applied",
				"value": "applied",
				"badgeClass": "badge-primary",
				"background": "#a54444"
			}
		]
	}
}
```

## 🛡️ Security Features

- **Token Storage**: Stored locally in browser (not on server)
- **GitHub API**: Direct connection to GitHub (no middleman)
- **Validation**: Input validation prevents corrupt configurations
- **Confirmation**: Requires confirmation before saving changes

## 📱 Alternative Solutions

### Option 3: Netlify/Vercel Hosting

- Upload files to Netlify or Vercel for free hosting
- Same GitHub API integration
- Custom domain support

### Option 4: Google Apps Script

- Free hosting on Google's infrastructure
- Can integrate with Google Sheets for even simpler management
- Email notifications when changes are made

### Option 5: Simple JSON Editor (Fallback)

If you prefer a simpler approach, use online JSON editors like:

- [JSON Editor Online](https://jsoneditoronline.org/)
- [JSONLint](https://jsonlint.com/)

## 🎮 Usage Instructions

1. **Access the Editor**: Go to your hosted URL
2. **Authenticate**: Enter your GitHub Personal Access Token
3. **Load Config**: Click "Load Configuration" to fetch current settings
4. **Edit Stages**:
   - Modify existing stages by changing labels, values, colors
   - Add new stages with the "Add Stage" button
   - Delete stages with the trash icon
   - Reorder by dragging the grip icon
5. **Preview**: Check the live preview to see how dropdowns will look
6. **Save**: Click "Save Changes" to update the GitHub file

## 🔍 Troubleshooting

### Common Issues:

**"GitHub API error: 401"**

- Check your GitHub token has `repo` permissions
- Token may have expired - generate a new one

**"Failed to load configuration"**

- Verify repository name and file path in `app.js`
- Check internet connection
- Ensure repository is accessible

**Changes not appearing in extension**

- GitHub CDN can take 2-5 minutes to update
- Clear browser cache
- Check if extension cache expired (you set it to 3 seconds)

## 🔧 Customization

To adapt for different repositories, edit `app.js`:

```javascript
constructor() {
    this.owner = 'your-github-username';
    this.repo = 'your-repo-name';
    this.filePath = 'your-config-file.json';
    // ... rest of configuration
}
```

## 📈 Future Enhancements

Possible additions:

- **Multi-user access**: Role-based permissions
- **Change history**: View previous configurations
- **Bulk import**: Upload CSV to create stages
- **API integration**: Direct Zoho API validation
- **Backup system**: Automatic backups before changes

This solution gives you a professional, user-friendly interface that non-technical users can easily operate while maintaining version control and security!
