local W = {}
local home = os.getenv("HOME")

W.workspaces = {
	default_workspace = "default",
	repositories = {
		{
			type = "personal",
			workspace = "default",
			name = "home",
			path = home,
		},
	},
}

return W
