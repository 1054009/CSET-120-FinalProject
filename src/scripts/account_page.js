let AccountPage = new Map()

/*
*
*	Entry page
*
*/
AccountPage.ENTRY_MODE_NEW = 1
AccountPage.ENTRY_MODE_EXISTING = 2
AccountPage.ENTRY_MODE_FORGOT = 3

/*
*	Handles the submit
*/
AccountPage.onEntrySubmit = () =>
{
	const form = document.getElementById("account_entry_form")
	if (!form) return true

	const mode = form.m_EntryMode
	if (!mode) return true

	const email_input = document.getElementById("account_entry_email")
	if (!email_input) return true

	const email = email_input.value

	const accountData = AccountManager.lookupAccount(email)
	if (!accountData && mode != AccountPage.ENTRY_MODE_NEW)
	{
		alert(`Account ${email} not found`)
		return false
	}

	switch (mode)
	{
		default:
		case AccountPage.ENTRY_MODE_NEW:
		{
			if (accountData)
			{
				alert(`Account with email ${email} already exists`)
				return false
			}

			const password_input = document.getElementById("account_entry_password")
			if (!password_input) break

			const password_input_confirm = document.getElementById("account_entry_password_confirm")
			if (!password_input_confirm) break

			const password = Helper.hash(password_input.value)
			const password_confirm = Helper.hash(password_input_confirm.value)

			if (password !== password_confirm)
			{
				alert("Passwords don't match")
				return false
			}

			if (AccountManager.signUpHashed(email, password) && AccountManager.loginHashed(email, password))
				alert("Account created")
			else
				alert("Failed to create account (???)")

			break
		}

		case AccountPage.ENTRY_MODE_EXISTING:
		{
			const password_input = document.getElementById("account_entry_password")
			if (!password_input) break

			if (!AccountManager.loginHashed(email, Helper.hash(password_input.value)))
			{
				alert("Failed to log in")
				return false
			}
			else
				alert("Welcome back")

			break
		}

		case AccountPage.ENTRY_MODE_FORGOT:
		{
			accountData[1] = Helper.hash("12345678")
			if (AccountManager.updateAccount(email, accountData))
				alert("Password reset to '12345678'")
			else
				alert("Failed to update password (???)")

			break
		}
	}

	return true
}

/*
*   Gets the text corresponding to the entry mode
*/
AccountPage.getEntryText = (mode) =>
{
    switch (mode)
    {
        default:
        case AccountPage.ENTRY_MODE_NEW:
            return "Sign up"

        case AccountPage.ENTRY_MODE_EXISTING:
            return "Login"

        case AccountPage.ENTRY_MODE_FORGOT:
            return "Forgot Password"
    }
}

/*
*   Creates a sub text
*/
AccountPage.createSubText = (preText, linkText, mode, secondary) =>
{
	const subText = document.createElement("p")
	subText.id = secondary ? "account_entry_subtext_2" : "account_entry_subtext"
	{
		subText.innerHTML = preText

		const a = document.createElement("a")
		a.classList.add("account_entry_subtext_link")
		a.m_SetupMode = mode
		{
			a.onclick = (event) =>
			{
				AccountPage.setupEntryPanel(event.target.m_SetupMode)
			}

			a.innerHTML = linkText
		}

		subText.appendChild(a)
	}

	return subText
}

/*
*   Sets up the form corresponding to the entry mode
*/
AccountPage.setupEntryForm = (form, mode) =>
{
	form.m_EntryMode = mode

	const email = document.createElement("h4")
	email.innerHTML = "Email Address"

	const email_input = document.createElement("input")
	email_input.id = "account_entry_email"
	{
		email_input.setAttribute("type", "text")
		email_input.setAttribute("placeholder", "Enter your email address")
		email_input.setAttribute("required", true)
	}

	form.appendChild(email)
	form.appendChild(email_input)

	switch (mode)
	{
		default:
		case AccountPage.ENTRY_MODE_NEW:
        case AccountPage.ENTRY_MODE_EXISTING:
        {
			const password = document.createElement("h4")
			password.innerHTML = "Password"

			const password_input = document.createElement("input")
			password_input.id = "account_entry_password"
			{
				password_input.setAttribute("type", "password")
				password_input.setAttribute("minlength", 8)
				password_input.setAttribute("maxlength", 255)
				password_input.setAttribute("placeholder", "Enter your desired password")
				password_input.setAttribute("required", true)
			}

			form.appendChild(password)
			form.appendChild(password_input)

			if (mode == AccountPage.ENTRY_MODE_NEW)
			{
				const password_input_confirm = document.createElement("input")
				password_input_confirm.id = "account_entry_password_confirm"
				{
					password_input_confirm.setAttribute("type", "password")
					password_input_confirm.setAttribute("minlength", 8)
					password_input_confirm.setAttribute("maxlength", 255)
					password_input_confirm.setAttribute("placeholder", "Confirm your password")
					password_input_confirm.setAttribute("required", true)
				}
				form.appendChild(password_input_confirm)
			}

			const preText = mode == AccountPage.ENTRY_MODE_NEW ? "Already have an account? " : "Don't remember your password? "
			const linkText = mode == AccountPage.ENTRY_MODE_NEW ? "Login" : "Forgot Password"
			const subMode = mode ==AccountPage.ENTRY_MODE_NEW ? AccountPage.ENTRY_MODE_EXISTING : AccountPage.ENTRY_MODE_FORGOT
			const subText = AccountPage.createSubText(preText, linkText, subMode, false)

			form.appendChild(subText)

			if (mode == AccountPage.ENTRY_MODE_EXISTING)
			{
				const secondaryText = AccountPage.createSubText("Don't have an account? ", "Sign Up", AccountPage.ENTRY_MODE_NEW, true)
				form.appendChild(secondaryText)
			}

			break
		}

        case AccountPage.ENTRY_MODE_FORGOT:
        {
			const subText = AccountPage.createSubText("Already have an account? ", "Login", AccountPage.ENTRY_MODE_EXISTING, false)
			const secondaryText = AccountPage.createSubText("Don't have an account? ", "Sign Up", AccountPage.ENTRY_MODE_NEW, true)

			form.appendChild(secondaryText)
			form.appendChild(subText)

			break
		}
	}

	const submit = document.createElement("input")
	submit.id = "account_entry_submit"
	{
		submit.setAttribute("type", "submit")
		submit.setAttribute("value", AccountPage.getEntryText(mode))
	}
	form.appendChild(submit)
}

/*
*   Create the sign up / login / forgot password page
*/
AccountPage.createEntryPanel = (mode) =>
{
    const container = document.createElement("div")
    container.id = "account_entry_container"
    {
        const panel = document.createElement("div")
        panel.id = "account_entry"
        {
            const title = document.createElement("h1")
            title.id = "account_entry_title"
            title.innerHTML = AccountPage.getEntryText(mode)

            const form = document.createElement("form")
            form.id = "account_entry_form"
            form.setAttribute("onsubmit", "return AccountPage.onEntrySubmit()")
            AccountPage.setupEntryForm(form, mode)

            panel.appendChild(title)
            panel.appendChild(form)
        }

        container.appendChild(panel)
    }

    return container
}

/*
*   Delete the sign up / login / forgot password page
*/
AccountPage.deleteEntryPanel = () =>
{
	const container = document.getElementById("account_entry_container")
	if (container)
	{
		container.remove()
	}
}

/*
*   Setup the sign up / login / forgot password page
*/
AccountPage.setupEntryPanel = (mode) =>
{
	AccountPage.deleteEntryPanel()

	const entryPanel = AccountPage.createEntryPanel(mode)
	document.body.appendChild(entryPanel)
}

/*
*
*	Account page
*
*/

///////////////////////////////////////////////////////////////////////////////
Helper.hookEvent(window, "load", false, () =>
{
    if (AccountManager.g_bLoggedIn === undefined) // Login process not yet completed
        return false

    if (AccountManager.g_bLoggedIn)
    {
        // Show normal account page
    }
    else
		AccountPage.setupEntryPanel(AccountPage.ENTRY_MODE_EXISTING)
})