
        // ===================================
        // CONFIGURATION
        // ===================================
        const API_BASE = 'http://localhost:5000/api';
        const SOCKET_URL = 'http://localhost:5000';
        
        // State management
        const state = {
            user: null,
            doctors: [],
            appointments: [],
            stats: {},
            socket: null
        };

        // ===================================
        // UTILITY FUNCTIONS
        // ===================================
        
        function showLoading() {
            document.getElementById('loadingOverlay').style.display = 'flex';
        }

        function hideLoading() {
            document.getElementById('loadingOverlay').style.display = 'none';
        }

        function showNotification(message, type = 'info') {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }

        function getAuthHeaders() {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            return headers;
        }

        function isAuthenticated() {
            return !!localStorage.getItem('token');
        }

        function saveSession(token, user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            state.user = user;
        }

        function clearSession() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            state.user = null;
            if (state.socket) {
                state.socket.disconnect();
            }
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }

        function getStatusColor(status) {
            const colors = {
                'pending': 'warning',
                'confirmed': 'info',
                'completed': 'success',
                'cancelled': 'danger'
            };
            return colors[status] || 'secondary';
        }

        // ===================================
        // WEBSOCKET FUNCTIONS
        // ===================================
        
        function initializeWebSocket() {
            if (!isAuthenticated() || state.socket) return;

            try {
                state.socket = io(SOCKET_URL);

                state.socket.on('connect', () => {
                    console.log('âœ… WebSocket connected');
                    const user = JSON.parse(localStorage.getItem('user'));
                    
                    state.socket.emit('join', {
                        userId: user.id,
                        role: user.role
                    });
                });

                state.socket.on('appointment:new', (data) => {
                    console.log('ðŸ“… New appointment:', data);
                    showNotification('New appointment booked!', 'info');
                    loadOverview();
                });

                state.socket.on('appointment:update', (data) => {
                    console.log('ðŸ”” Appointment updated:', data);
                    showNotification(`Appointment status: ${data.status}`, 'info');
                    loadOverview();
                });

                state.socket.on('appointment:confirm', (data) => {
                    console.log('âœ… Appointment confirmed:', data);
                    showNotification('Your appointment has been confirmed!', 'success');
                    loadOverview();
                });

                state.socket.on('appointment:cancel', (data) => {
                    console.log('âŒ Appointment cancelled:', data);
                    showNotification('Appointment was cancelled', 'error');
                    loadOverview();
                });

                state.socket.on('disconnect', () => {
                    console.log('âŒ WebSocket disconnected');
                });

            } catch (error) {
                console.error('WebSocket error:', error);
            }
        }

        // ===================================
        // AUTHENTICATION FUNCTIONS
        // ===================================
        
        async function handleLogin(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showNotification('Please enter username and password', 'error');
                return;
            }
            
            showLoading();
            
            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: username,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    saveSession(data.data.token, data.data.user);
                    initializeWebSocket();
                    
                    document.getElementById('loginContainer').classList.add('d-none');
                    document.getElementById('dashboardContainer').style.display = 'block';
                    
                    await loadOverview();
                    
                    document.getElementById('userName').textContent = data.data.user.name;
                    document.getElementById('userRole').textContent = 
                        data.data.user.role.charAt(0).toUpperCase() + data.data.user.role.slice(1);

                    buildSidebar(data.data.user.role);
                    showNotification('Login successful!', 'success');
                } else {
                    showNotification(data.message || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showNotification('Login failed. Please check your connection', 'error');
            } finally {
                hideLoading();
            }
        }

        async function handleLogout() {
            try {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: getAuthHeaders()
                });
                
                clearSession();
                
                document.getElementById('dashboardContainer').style.display = 'none';
                document.getElementById('loginContainer').classList.remove('d-none');
                document.getElementById('loginForm').reset();
                
                showNotification('Logged out successfully', 'success');
            } catch (error) {
                console.error('Logout error:', error);
                clearSession();
                location.reload();
            }
        }

        // ===================================
        // DASHBOARD FUNCTIONS
        // ===================================
        
        async function loadOverview() {
            showLoading();
            
            try {
                const [statsResponse, appointmentsResponse] = await Promise.all([
                    fetch(`${API_BASE}/appointments/stats`, {
                        headers: getAuthHeaders()
                    }),
                    fetch(`${API_BASE}/appointments/upcoming?limit=5`, {
                        headers: getAuthHeaders()
                    })
                ]);
                
                const statsData = await statsResponse.json();
                const appointmentsData = await appointmentsResponse.json();
                
                if (statsData.success) {
                    state.stats = statsData.data;
                    updateStatsDisplay(statsData.data);
                }
                
                if (appointmentsData.success) {
                    state.appointments = appointmentsData.data;
                    updateAppointmentsList(appointmentsData.data);
                }
                
            } catch (error) {
                console.error('Error loading overview:', error);
                showNotification('Failed to load dashboard data', 'error');
            } finally {
                hideLoading();
            }
        }

        function updateStatsDisplay(stats) {
            const statsContainer = document.getElementById('statsContainer');
            if (!statsContainer) return;

            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-details">
                        <h3>${stats.total || 0}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-details">
                        <h3>${stats.pending || 0}</h3>
                        <p>Pending</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-details">
                        <h3>${stats.confirmed || 0}</h3>
                        <p>Confirmed</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <div class="stat-details">
                        <h3>${stats.today || 0}</h3>
                        <p>Today</p>
                    </div>
                </div>
            `;
        }

        function updateAppointmentsList(appointments) {
            const appointmentsList = document.getElementById('upcomingAppointments');
            if (!appointmentsList) return;

            if (!appointments || appointments.length === 0) {
                appointmentsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>No upcoming appointments</p>
                    </div>
                `;
                return;
            }

            appointmentsList.innerHTML = appointments.map(apt => `
                <div class="appointment-item">
                    <div class="appointment-header">
                        <span class="appointment-badge badge-${apt.status}">${apt.status.toUpperCase()}</span>
                        <span class="text-muted">${formatDate(apt.date)}</span>
                    </div>
                    <div class="appointment-body">
                        <h6>${(() => { const n = apt.doctorName || apt.doctor?.name || 'Doctor'; return n.startsWith('Dr.') ? n : 'Dr. ' + n; })()}</h6>
                        <p><i class="fas fa-clock"></i> ${apt.time}</p>
                        <p><i class="fas fa-hospital"></i> ${apt.department}</p>
                        ${apt.reason ? `<p><i class="fas fa-notes-medical"></i> ${apt.reason}</p>` : ''}
                    </div>
                    <div class="appointment-actions">
                        <button class="btn-sm btn-primary" onclick="viewAppointmentDetails('${apt._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${apt.status === 'pending' || apt.status === 'confirmed' ? 
                            `<button class="btn-sm btn-danger" onclick="cancelAppointment('${apt._id}')">
                                <i class="fas fa-times"></i> Cancel
                            </button>` : ''}
                    </div>
                </div>
            `).join('');
        }

        // ===================================
        // APPOINTMENT BOOKING
        // ===================================
        
        async function showBookingModal() {
            document.getElementById('appointmentModal').classList.add('active');
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('appointmentDate').min = today;
            
            showLoading();
            
            try {
                const [departmentsResponse, doctorsResponse] = await Promise.all([
                    fetch(`${API_BASE}/users/departments`),
                    fetch(`${API_BASE}/users/doctors`)
                ]);
                
                const departmentsData = await departmentsResponse.json();
                const doctorsData = await doctorsResponse.json();
                
                const deptSelect = document.getElementById('department');
                deptSelect.innerHTML = '<option value="">Select Department</option>';
                
                if (departmentsData.success && departmentsData.data) {
                    departmentsData.data.forEach(dept => {
                        deptSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
                    });
                }
                
                const doctorSelect = document.getElementById('doctorSelect');
                doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
                
                if (doctorsData.success && doctorsData.data) {
                    state.doctors = doctorsData.data;
                    doctorsData.data.forEach(doctor => {
                        doctorSelect.innerHTML += `<option value="${doctor._id}" data-dept="${doctor.specialization}">
                            ${doctor.name.startsWith('Dr.') ? doctor.name : 'Dr. ' + doctor.name} - ${doctor.specialization}
                        </option>`;
                    });
                }
                
                // Add event listeners
                deptSelect.addEventListener('change', filterDoctorsByDepartment);
                doctorSelect.addEventListener('change', loadTimeSlots);
                document.getElementById('appointmentDate').addEventListener('change', loadTimeSlots);
                
            } catch (error) {
                console.error('Error loading booking form:', error);
                showNotification('Failed to load booking form', 'error');
            } finally {
                hideLoading();
            }
        }

        function filterDoctorsByDepartment() {
            const deptSelect = document.getElementById('department');
            const doctorSelect = document.getElementById('doctorSelect');
            const selectedDept = deptSelect.value;
            
            doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
            
            if (!selectedDept) {
                state.doctors.forEach(doctor => {
                    doctorSelect.innerHTML += `<option value="${doctor._id}">
                        ${doctor.name.startsWith('Dr.') ? doctor.name : 'Dr. ' + doctor.name} - ${doctor.specialization}
                    </option>`;
                });
                return;
            }
            
            const filteredDoctors = state.doctors.filter(d => d.specialization === selectedDept);
            filteredDoctors.forEach(doctor => {
                doctorSelect.innerHTML += `<option value="${doctor._id}">
                    ${doctor.name.startsWith('Dr.') ? doctor.name : 'Dr. ' + doctor.name}
                </option>`;
            });
            
            document.getElementById('timeSlots').innerHTML = 
                '<p class="text-muted" style="grid-column: 1/-1;">Please select a doctor</p>';
        }

        async function loadTimeSlots() {
            const doctorSelect = document.getElementById('doctorSelect');
            const dateInput = document.getElementById('appointmentDate');
            
            if (!doctorSelect.value || !dateInput.value) {
                document.getElementById('timeSlots').innerHTML = 
                    '<p class="text-muted" style="grid-column: 1/-1;">Please select doctor and date first</p>';
                return;
            }
            
            try {
                const response = await fetch(
                    `${API_BASE}/appointments/slots/available?doctorId=${doctorSelect.value}&date=${dateInput.value}`
                );
                const data = await response.json();
                
                const container = document.getElementById('timeSlots');
                
                if (data.success && data.data && data.data.length > 0) {
                    container.innerHTML = data.data.map(slot => `
                        <button type="button" class="time-slot-btn" data-time="${slot}" onclick="selectTimeSlot(event, '${slot}')">
                            ${slot}
                        </button>
                    `).join('');
                } else {
                    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No available slots for this date</p>';
                }
            } catch (error) {
                console.error('Error loading time slots:', error);
                document.getElementById('timeSlots').innerHTML = 
                    '<p class="text-danger" style="grid-column: 1/-1;">Error loading time slots</p>';
            }
        }

        function selectTimeSlot(event, time) {
            document.querySelectorAll('.time-slot-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            event.target.classList.add('selected');
        }

        async function handleAppointment(e) {
            e.preventDefault();
            
            const department = document.getElementById('department').value;
            const doctorId = document.getElementById('doctorSelect').value;
            const date = document.getElementById('appointmentDate').value;
            const reason = document.getElementById('appointmentReason').value || '';
            const selectedTimeBtn = document.querySelector('.time-slot-btn.selected');
            
            if (!department || !doctorId || !date || !selectedTimeBtn) {
                showNotification('Please fill all required fields and select a time slot', 'error');
                return;
            }
            
            const time = selectedTimeBtn.dataset.time;
            
            showLoading();
            
            try {
                const response = await fetch(`${API_BASE}/appointments`, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        doctorId: doctorId,
                        department: department,
                        date: date,
                        time: time,
                        reason: reason
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    if (state.socket) {
                        state.socket.emit('appointment:new', {
                            appointmentId: data.data._id,
                            doctorId: doctorId,
                            patientId: state.user.id
                        });
                    }
                    
                    hideModal();
                    showNotification('Appointment booked successfully!', 'success');
                    await loadOverview();
                } else {
                    showNotification(data.message || 'Failed to book appointment', 'error');
                }
            } catch (error) {
                console.error('Booking error:', error);
                showNotification('Error booking appointment', 'error');
            } finally {
                hideLoading();
            }
        }

        // ===================================
        // APPOINTMENT ACTIONS
        // ===================================
        
        async function viewAppointmentDetails(id) {
            try {
                const response = await fetch(`${API_BASE}/appointments/${id}`, {
                    headers: getAuthHeaders()
                });
                
                const data = await response.json();
                
                if (data.success && data.data) {
                    const apt = data.data;
                    const details = `
Appointment Details:
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ID: ${apt.appointmentId}
Date: ${formatDate(apt.date)}
Time: ${apt.time}
Status: ${apt.status}

Doctor: ${apt.doctorName || apt.doctor?.name}
Department: ${apt.department}
${apt.reason ? `Reason: ${apt.reason}` : ''}
${apt.diagnosis ? `Diagnosis: ${apt.diagnosis}` : ''}
${apt.prescription ? `Prescription: ${apt.prescription}` : ''}
                    `;
                    alert(details);
                } else {
                    showNotification('Appointment not found', 'error');
                }
            } catch (error) {
                console.error('Error loading appointment:', error);
                showNotification('Failed to load appointment details', 'error');
            }
        }

        async function cancelAppointment(id) {
            if (!confirm('Are you sure you want to cancel this appointment?')) {
                return;
            }
            
            const reason = prompt('Please provide a reason for cancellation (optional):');
            
            showLoading();
            
            try {
                const response = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        reason: reason || 'No reason provided'
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    if (state.socket) {
                        const apt = state.appointments.find(a => a._id === id);
                        if (apt) {
                            state.socket.emit('appointment:cancel', {
                                appointmentId: id,
                                doctorId: apt.doctor?._id || apt.doctor,
                                patientId: state.user.id
                            });
                        }
                    }
                    
                    showNotification('Appointment cancelled successfully', 'success');
                    await loadOverview();
                } else {
                    showNotification(data.message || 'Failed to cancel appointment', 'error');
                }
            } catch (error) {
                console.error('Cancel error:', error);
                showNotification('Error cancelling appointment', 'error');
            } finally {
                hideLoading();
            }
        }

        function hideModal() {
            document.getElementById('appointmentModal').classList.remove('active');
            document.getElementById('appointmentForm').reset();
        }

        // ===================================
        // ROLE-BASED SIDEBAR
        // ===================================

        function buildSidebar(role) {
            const menu = document.getElementById('sidebarMenu');

            // Common items for all roles
            let items = `
                <li><a href="#" class="active" onclick="showSection('overview', event)">
                    <i class="fas fa-home"></i> Dashboard
                </a></li>
                <li><a href="#" onclick="showSection('appointments', event)">
                    <i class="fas fa-calendar-alt"></i> Appointments
                </a></li>`;

            if (role === 'patient') {
                // Patients see: Doctors list + Prescriptions
                items += `
                <li><a href="#" onclick="showSection('doctors', event)">
                    <i class="fas fa-user-md"></i> Doctors
                </a></li>
                <li><a href="#" onclick="showSection('prescriptions', event)">
                    <i class="fas fa-pills"></i> Prescriptions
                </a></li>`;
            } else if (role === 'doctor') {
                // Doctors see: My Patients + Prescriptions
                items += `
                <li><a href="#" onclick="showSection('patients', event)">
                    <i class="fas fa-users"></i> My Patients
                </a></li>
                <li><a href="#" onclick="showSection('prescriptions', event)">
                    <i class="fas fa-pills"></i> Prescriptions
                </a></li>`;
            } else if (role === 'admin') {
                // Admins see everything
                items += `
                <li><a href="#" onclick="showSection('doctors', event)">
                    <i class="fas fa-user-md"></i> Doctors
                </a></li>
                <li><a href="#" onclick="showSection('patients', event)">
                    <i class="fas fa-users"></i> Patients
                </a></li>
                <li><a href="#" onclick="showSection('prescriptions', event)">
                    <i class="fas fa-pills"></i> Prescriptions
                </a></li>`;
            }

            // Profile and logout for all
            items += `
                <li><a href="#" onclick="showSection('profile', event)">
                    <i class="fas fa-user-circle"></i> Profile
                </a></li>
                <li><a href="#" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a></li>`;

            menu.innerHTML = items;
        }

        // ===================================
        // SECTION NAVIGATION
        // ===================================

        function showSection(section, event) {
            // Hide all sections
            const sections = ['overviewSection', 'prescriptionsSection', 'doctorsSection', 'patientsSection'];
            sections.forEach(s => {
                const el = document.getElementById(s);
                if (el) el.style.display = 'none';
            });

            // Remove active from all sidebar links
            document.querySelectorAll('.sidebar-menu li a').forEach(a => a.classList.remove('active'));

            // Show selected section and load data
            if (section === 'overview') {
                document.getElementById('overviewSection').style.display = 'block';
                loadOverview();
            } else if (section === 'prescriptions') {
                document.getElementById('prescriptionsSection').style.display = 'block';
                loadPrescriptions();
                if (state.user && state.user.role === 'doctor') {
                    document.getElementById('completeAppointmentPanel').style.display = 'block';
                    loadDoctorConfirmedAppointments();
                }
            } else if (section === 'doctors') {
                document.getElementById('doctorsSection').style.display = 'block';
                loadDoctorsSection();
            } else if (section === 'patients') {
                document.getElementById('patientsSection').style.display = 'block';
                loadPatientsSection();
            }

            // Set active on clicked link
            if (event && event.target) {
                event.target.closest('a').classList.add('active');
            }
        }

        // ===================================
        // DOCTORS SECTION (Patients view)
        // ===================================

        async function loadDoctorsSection() {
            const list = document.getElementById('doctorsList');
            list.innerHTML = '<div class="empty-state"><div class="spinner" style="width:30px;height:30px;border-width:3px;"></div><p>Loading doctors...</p></div>';

            try {
                const [doctorsRes, deptsRes] = await Promise.all([
                    fetch(`${API_BASE}/users/doctors`),
                    fetch(`${API_BASE}/users/departments`)
                ]);

                const doctorsData = await doctorsRes.json();
                const deptsData = await deptsRes.json();

                // Populate department filter
                const deptFilter = document.getElementById('doctorDeptFilter');
                deptFilter.innerHTML = '<option value="">All Departments</option>';
                if (deptsData.success) {
                    deptsData.data.forEach(d => {
                        deptFilter.innerHTML += `<option value="${d}">${d}</option>`;
                    });
                }

                if (doctorsData.success && doctorsData.data.length > 0) {
                    state.doctors = doctorsData.data;
                    renderDoctorCards(doctorsData.data);
                } else {
                    list.innerHTML = '<div class="empty-state"><i class="fas fa-user-md"></i><p>No doctors found</p></div>';
                }
            } catch (error) {
                list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Error loading doctors</p></div>';
            }
        }

        function renderDoctorCards(doctors) {
            const list = document.getElementById('doctorsList');
            if (!doctors || doctors.length === 0) {
                list.innerHTML = '<div class="empty-state"><i class="fas fa-user-md"></i><p>No doctors found</p></div>';
                return;
            }

            list.innerHTML = doctors.map(doctor => {
                const name = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`;
                return `
                <div class="doctor-card">
                    <div class="doctor-avatar">
                        <i class="fas fa-user-md"></i>
                    </div>
                    <h5>${name}</h5>
                    <p class="specialization"><i class="fas fa-stethoscope"></i> ${doctor.specialization || 'General'}</p>
                    <p class="experience">${doctor.experience ? `${doctor.experience} years experience` : ''}</p>
                    <button class="btn-book-doctor" onclick="quickBookDoctor('${doctor._id}', '${doctor.specialization}')">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>`;
            }).join('');
        }

        function filterDoctorsSection() {
            const dept = document.getElementById('doctorDeptFilter').value;
            if (!dept) {
                renderDoctorCards(state.doctors);
            } else {
                renderDoctorCards(state.doctors.filter(d => d.specialization === dept));
            }
        }

        function quickBookDoctor(doctorId, specialization) {
            // Pre-fill the booking modal with this doctor
            showBookingModal().then(() => {
                const deptSelect = document.getElementById('department');
                const doctorSelect = document.getElementById('doctorSelect');

                // Set department
                if (deptSelect) {
                    deptSelect.value = specialization;
                    filterDoctorsByDepartment();
                }

                // Set doctor
                setTimeout(() => {
                    if (doctorSelect) {
                        doctorSelect.value = doctorId;
                        loadTimeSlots();
                    }
                }, 100);
            });
        }

        // ===================================
        // PATIENTS SECTION (Doctors view)
        // ===================================

        async function loadPatientsSection() {
            const list = document.getElementById('patientsList');
            list.innerHTML = '<div class="empty-state"><div class="spinner" style="width:30px;height:30px;border-width:3px;"></div><p>Loading patients...</p></div>';

            try {
                // Get all appointments for this doctor
                const response = await fetch(`${API_BASE}/appointments?limit=100`, {
                    headers: getAuthHeaders()
                });

                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    // Group by patient
                    const patientMap = {};
                    data.data.forEach(apt => {
                        const pid = apt.patient?._id || apt.patient;
                        if (!patientMap[pid]) {
                            patientMap[pid] = {
                                id: pid,
                                name: apt.patientName,
                                email: apt.patientEmail,
                                phone: apt.patientPhone,
                                appointments: []
                            };
                        }
                        patientMap[pid].appointments.push(apt);
                    });

                    const patients = Object.values(patientMap);

                    // Update count badge
                    document.getElementById('patientCount').textContent = `${patients.length} Patients`;

                    list.innerHTML = patients.map(patient => {
                        const pending = patient.appointments.filter(a => a.status === 'pending').length;
                        const confirmed = patient.appointments.filter(a => a.status === 'confirmed').length;
                        const completed = patient.appointments.filter(a => a.status === 'completed').length;
                        const latest = patient.appointments[0];

                        return `
                        <div class="patient-card">
                            <div class="patient-avatar">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="patient-info">
                                <h6>${patient.name}</h6>
                                ${patient.email ? `<p><i class="fas fa-envelope" style="margin-right:5px;"></i>${patient.email}</p>` : ''}
                                ${patient.phone ? `<p><i class="fas fa-phone" style="margin-right:5px;"></i>${patient.phone}</p>` : ''}
                                <p style="margin-top:5px;">
                                    ${pending > 0 ? `<span style="background:#fff3cd;color:#856404;padding:2px 8px;border-radius:10px;font-size:11px;margin-right:4px;">${pending} Pending</span>` : ''}
                                    ${confirmed > 0 ? `<span style="background:#d1ecf1;color:#0c5460;padding:2px 8px;border-radius:10px;font-size:11px;margin-right:4px;">${confirmed} Confirmed</span>` : ''}
                                    ${completed > 0 ? `<span style="background:#d4edda;color:#155724;padding:2px 8px;border-radius:10px;font-size:11px;">${completed} Completed</span>` : ''}
                                </p>
                            </div>
                            <div class="patient-stats">
                                <span class="count">${patient.appointments.length}</span>
                                <span class="label">Appointments</span>
                            </div>
                        </div>`;
                    }).join('');
                } else {
                    list.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>No patients yet</p>
                            <small style="color:#aaa;">Patients will appear here once they book appointments with you</small>
                        </div>`;
                    document.getElementById('patientCount').textContent = '0 Patients';
                }
            } catch (error) {
                console.error('Error loading patients:', error);
                list.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Error loading patients</p></div>';
            }
        }

        // ===================================
        // PRESCRIPTIONS
        // ===================================

        async function loadPrescriptions() {
            const list = document.getElementById('prescriptionsList');
            list.innerHTML = '<div class="empty-state"><div class="spinner" style="width:30px;height:30px;border-width:3px;"></div><p>Loading...</p></div>';

            try {
                // Get completed appointments (which have prescriptions)
                const response = await fetch(`${API_BASE}/appointments?status=completed&limit=50`, {
                    headers: getAuthHeaders()
                });

                const data = await response.json();

                if (data.success && data.data && data.data.length > 0) {
                    // Filter only those with diagnosis or prescription
                    const withPrescriptions = data.data.filter(apt => apt.diagnosis || apt.prescription);

                    if (withPrescriptions.length === 0) {
                        list.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-pills"></i>
                                <p>No prescriptions yet</p>
                                <small style="color:#aaa;">Prescriptions appear here after a doctor completes your appointment</small>
                            </div>`;
                        return;
                    }

                    list.innerHTML = withPrescriptions.map(apt => `
                        <div class="prescription-card" id="presc_${apt._id}">
                            <div class="prescription-header">
                                <h5><i class="fas fa-user-md" style="color:var(--secondary);margin-right:8px;"></i>${(() => { const n = apt.doctorName || 'Doctor'; return n.startsWith('Dr.') ? n : 'Dr. ' + n; })()}</h5>
                                <span class="prescription-date"><i class="fas fa-calendar"></i> ${formatDate(apt.date)}</span>
                            </div>

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
                                <div style="font-size:13px; color:#6c757d;">
                                    <i class="fas fa-hospital" style="color:var(--secondary);margin-right:5px;"></i>
                                    <strong>Department:</strong> ${apt.department}
                                </div>
                                <div style="font-size:13px; color:#6c757d;">
                                    <i class="fas fa-clock" style="color:var(--secondary);margin-right:5px;"></i>
                                    <strong>Time:</strong> ${apt.time}
                                </div>
                                ${apt.reason ? `
                                <div style="font-size:13px; color:#6c757d; grid-column:1/-1;">
                                    <i class="fas fa-notes-medical" style="color:var(--secondary);margin-right:5px;"></i>
                                    <strong>Reason:</strong> ${apt.reason}
                                </div>` : ''}
                            </div>

                            ${apt.diagnosis ? `
                            <div class="prescription-section">
                                <label><i class="fas fa-stethoscope"></i> Diagnosis</label>
                                <p>${apt.diagnosis}</p>
                            </div>` : ''}

                            ${apt.prescription ? `
                            <div class="prescription-section">
                                <label><i class="fas fa-pills"></i> Prescription</label>
                                <p>${apt.prescription}</p>
                            </div>` : ''}

                            ${apt.notes ? `
                            <div class="prescription-section">
                                <label><i class="fas fa-clipboard"></i> Doctor Notes</label>
                                <p>${apt.notes}</p>
                            </div>` : ''}

                            <div class="prescription-footer">
                                <span>
                                    <i class="fas fa-id-card" style="margin-right:5px;"></i>
                                    Ref: ${apt.appointmentId || apt._id}
                                </span>
                                <button class="btn-print" onclick="printPrescription('presc_${apt._id}', '${apt.appointmentId || apt._id}')">
                                    <i class="fas fa-print"></i> Print
                                </button>
                            </div>
                        </div>
                    `).join('');
                } else {
                    list.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-pills"></i>
                            <p>No prescriptions yet</p>
                            <small style="color:#aaa;">Prescriptions appear here after a doctor completes your appointment</small>
                        </div>`;
                }
            } catch (error) {
                console.error('Error loading prescriptions:', error);
                list.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle" style="color:var(--danger);"></i><p>Error loading prescriptions</p></div>`;
            }
        }

        async function loadDoctorConfirmedAppointments() {
            try {
                const response = await fetch(`${API_BASE}/appointments?status=confirmed&limit=50`, {
                    headers: getAuthHeaders()
                });

                const data = await response.json();
                const select = document.getElementById('appointmentToComplete');
                select.innerHTML = '<option value="">Select confirmed appointment...</option>';

                if (data.success && data.data && data.data.length > 0) {
                    data.data.forEach(apt => {
                        select.innerHTML += `<option value="${apt._id}">
                            ${apt.patientName} - ${formatDate(apt.date)} at ${apt.time} (${apt.department})
                        </option>`;
                    });
                } else {
                    select.innerHTML = '<option value="">No confirmed appointments found</option>';
                }
            } catch (error) {
                console.error('Error loading appointments for doctor:', error);
            }
        }

        async function handleCompleteAppointment(e) {
            e.preventDefault();

            const appointmentId = document.getElementById('appointmentToComplete').value;
            const diagnosis = document.getElementById('diagnosisInput').value.trim();
            const prescription = document.getElementById('prescriptionInput').value.trim();
            const notes = document.getElementById('notesInput').value.trim();

            if (!appointmentId) {
                showNotification('Please select an appointment to complete', 'error');
                return;
            }

            if (!diagnosis && !prescription) {
                showNotification('Please enter at least a diagnosis or prescription', 'error');
                return;
            }

            showLoading();

            try {
                const response = await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ diagnosis, prescription, notes })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('Appointment completed and prescription saved!', 'success');
                    document.getElementById('completeAppointmentForm').reset();
                    // Reload prescriptions and appointments
                    await loadPrescriptions();
                    await loadDoctorConfirmedAppointments();
                } else {
                    showNotification(data.message || 'Failed to complete appointment', 'error');
                }
            } catch (error) {
                console.error('Complete appointment error:', error);
                showNotification('Error completing appointment', 'error');
            } finally {
                hideLoading();
            }
        }

        function printPrescription(cardId, refId) {
            const card = document.getElementById(cardId);
            if (!card) return;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Prescription - ${refId}</title>
                    <link rel="stylesheet" href="css/print.css">
                </head>
                <body>
                    <h1>ðŸ¥ Mediplus Hospital</h1>
                    <div class="header">
                        <div><strong>Reference:</strong> ${refId}</div>
                        <div><span class="badge">COMPLETED</span></div>
                    </div>
                    ${card.innerHTML}
                    <div class="footer">
                        <p>This is a digital prescription generated by Mediplus Hospital Management System.</p>
                        <p>Printed on: ${new Date().toLocaleString()}</p>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }

        // ===================================
        // PAGE INITIALIZATION
        // ===================================
        
        // ===================================
        // TAB SWITCHING
        // ===================================
        
        function switchTab(tab) {
            const loginContainer = document.getElementById('loginForm_container');
            const registerContainer = document.getElementById('registerForm_container');
            const loginTab = document.getElementById('loginTab');
            const registerTab = document.getElementById('registerTab');

            if (tab === 'login') {
                loginContainer.style.display = 'block';
                registerContainer.style.display = 'none';
                loginTab.classList.add('active');
                registerTab.classList.remove('active');
            } else {
                loginContainer.style.display = 'none';
                registerContainer.style.display = 'block';
                loginTab.classList.remove('active');
                registerTab.classList.add('active');
            }
        }

        // ===================================
        // REGISTRATION FUNCTION
        // ===================================
        
        async function handleRegister(e) {
            e.preventDefault();

            const name = document.getElementById('reg_name').value.trim();
            const email = document.getElementById('reg_email').value.trim();
            const username = document.getElementById('reg_username').value.trim();
            const phone = document.getElementById('reg_phone').value.trim();
            const role = document.getElementById('reg_role').value;
            const password = document.getElementById('reg_password').value;
            const confirmPassword = document.getElementById('reg_confirm_password').value;

            // Validate
            if (!name || !email || !username || !password) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            if (password.length < 6) {
                showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }

            showLoading();

            try {
                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, username, phone, role, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Auto login after registration
                    saveSession(data.data.token, data.data.user);
                    initializeWebSocket();

                    document.getElementById('loginContainer').classList.add('d-none');
                    document.getElementById('dashboardContainer').style.display = 'block';

                    document.getElementById('userName').textContent = data.data.user.name;
                    document.getElementById('userRole').textContent =
                        data.data.user.role.charAt(0).toUpperCase() + data.data.user.role.slice(1);

                    buildSidebar(data.data.user.role);
                    await loadOverview();

                    showNotification(`Welcome, ${data.data.user.name}! Account created successfully!`, 'success');
                } else {
                    showNotification(data.message || 'Registration failed', 'error');
                }
            } catch (error) {
                console.error('Register error:', error);
                showNotification('Registration failed. Please check your connection.', 'error');
            } finally {
                hideLoading();
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            console.log('Mediplus System Initialized');
            console.log('API Base:', API_BASE);
            
            // Setup login form
            document.getElementById('loginForm').addEventListener('submit', handleLogin);
            document.getElementById('appointmentForm').addEventListener('submit', handleAppointment);
            document.getElementById('registerForm').addEventListener('submit', handleRegister);
            document.getElementById('completeAppointmentForm').addEventListener('submit', handleCompleteAppointment);
            
            // Check if user is already logged in
            const token = localStorage.getItem('token');
            const userJson = localStorage.getItem('user');
            
            if (token && userJson) {
                try {
                    state.user = JSON.parse(userJson);
                    
                    // Verify token is still valid
                    const response = await fetch(`${API_BASE}/auth/verify-token`, {
                        headers: getAuthHeaders()
                    });
                    
                    if (response.ok) {
                        document.getElementById('loginContainer').classList.add('d-none');
                        document.getElementById('dashboardContainer').style.display = 'block';
                        
                        document.getElementById('userName').textContent = state.user.name;
                        document.getElementById('userRole').textContent = 
                            state.user.role.charAt(0).toUpperCase() + state.user.role.slice(1);

                        buildSidebar(state.user.role);
                        initializeWebSocket();
                        await loadOverview();
                    } else {
                        clearSession();
                    }
                } catch (error) {
                    console.error('Session restore error:', error);
                    clearSession();
                }
            }
        });
    

