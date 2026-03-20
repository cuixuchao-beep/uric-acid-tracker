/**
 * Uric Acid Tracker - Main JavaScript
 * 尿酸指数记录应用
 */

// ================================
// Constants & Configuration
// ================================
const STORAGE_KEY = 'uric_acid_records';
const UNIT_MGDL = 'mgdl';
const UNIT_UMOL = 'umol';

// Conversion factors
const MGDL_TO_UMOL = 59.48; // 1 mg/dL = 59.48 μmol/L
const UMOL_TO_MGDL = 1 / 59.48;

// Normal ranges (in mg/dL)
const RANGES = {
    male: { min: 3.4, max: 7.0 },
    female: { min: 2.4, max: 6.0 }
};

// Default settings
let currentUnit = UNIT_MGDL;
let chartRange = 30;
let currentPage = 1;
const PAGE_SIZE = 10;
let chart = null;
let allRecords = [];

// ================================
// Initialization
// ================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize date input to today
    document.getElementById('recordDate').valueAsDate = new Date();
    
    // Load saved unit preference
    const savedUnit = localStorage.getItem('uric_acid_unit');
    if (savedUnit) {
        setUnit(savedUnit);
    }
    
    // Load data
    loadData();
    
    // Update statistics
    updateStatistics();
    
    // Initialize chart
    initChart();
    
    // Render history
    renderHistory();
    
    // Register service worker for PWA
    registerServiceWorker();
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});

// ================================
// Data Management
// ================================
function loadData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        allRecords = data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error loading data:', e);
        allRecords = [];
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
    } catch (e) {
        console.error('Error saving data:', e);
        showToast('数据保存失败', 'error');
    }
}

function addRecord(record) {
    const newRecord = {
        id: Date.now().toString(),
        date: record.date,
        time: record.time || '',
        value: parseFloat(record.value),
        originalValue: parseFloat(record.originalValue),
        originalUnit: record.originalUnit,
        notes: record.notes || '',
        createdAt: new Date().toISOString()
    };
    
    allRecords.unshift(newRecord);
    saveData();
    return newRecord;
}

function updateRecord(id, updatedData) {
    const index = allRecords.findIndex(r => r.id === id);
    if (index !== -1) {
        const originalRecord = allRecords[index];
        
        allRecords[index] = {
            ...originalRecord,
            date: updatedData.date || originalRecord.date,
            time: updatedData.time !== undefined ? updatedData.time : originalRecord.time,
            value: updatedData.value !== undefined ? parseFloat(updatedData.value) : originalRecord.value,
            originalValue: updatedData.originalValue !== undefined ? parseFloat(updatedData.originalValue) : originalRecord.originalValue,
            originalUnit: updatedData.originalUnit || originalRecord.originalUnit,
            notes: updatedData.notes !== undefined ? updatedData.notes : originalRecord.notes,
            updatedAt: new Date().toISOString()
        };
        
        saveData();
        return true;
    }
    return false;
}

function deleteRecord(id) {
    const index = allRecords.findIndex(r => r.id === id);
    if (index !== -1) {
        allRecords.splice(index, 1);
        saveData();
        return true;
    }
    return false;
}

function getRecordValue(record) {
    // Return value in current unit
    if (record.originalUnit === currentUnit) {
        return record.value;
    }
    
    if (currentUnit === UNIT_UMOL && record.originalUnit === UNIT_MGDL) {
        return (record.originalValue * MGDL_TO_UMOL).toFixed(1);
    } else if (currentUnit === UNIT_MGDL && record.originalUnit === UNIT_UMOL) {
        return (record.originalValue * UMOL_TO_MGDL).toFixed(2);
    }
    
    return record.value;
}

// ================================
// Unit Conversion
// ================================
function setUnit(unit) {
    currentUnit = unit;
    localStorage.setItem('uric_acid_unit', unit);
    
    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.unit === unit);
    });
    
    // Update unit labels
    document.querySelectorAll('.unit-label').forEach(label => {
        label.textContent = unit === UNIT_MGDL ? '(mg/dL)' : '(μmol/L)';
    });
    
    // Update form placeholder
    const input = document.getElementById('uricValue');
    input.placeholder = unit === UNIT_MGDL ? '例如: 5.5' : '例如: 327';
    input.max = unit === UNIT_MGDL ? '1000' : '1000';
    
    // Re-render components with new unit
    updateStatistics();
    initChart();
    renderHistory();
}

function convertValue(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    
    if (fromUnit === UNIT_MGDL && toUnit === UNIT_UMOL) {
        return value * MGDL_TO_UMOL;
    } else if (fromUnit === UNIT_UMOL && toUnit === UNIT_MGDL) {
        return value * UMOL_TO_MGDL;
    }
    
    return value;
}

// ================================
// Form Handling
// ================================
function saveRecord(event) {
    event.preventDefault();
    
    const date = document.getElementById('recordDate').value;
    const time = document.getElementById('recordTime').value;
    const value = parseFloat(document.getElementById('uricValue').value);
    const notes = document.getElementById('notes').value;
    
    if (!date || isNaN(value)) {
        showToast('请填写必填项', 'error');
        return;
    }
    
    // Store the original value and unit
    const record = {
        date,
        time,
        value: value,
        originalValue: value,
        originalUnit: currentUnit,
        notes
    };
    
    addRecord(record);
    
    // Reset form (keep today's date)
    document.getElementById('recordForm').reset();
    document.getElementById('recordDate').valueAsDate = new Date();
    document.getElementById('recordTime').value = '';
    
    // Update UI
    updateStatistics();
    initChart();
    renderHistory();
    
    showToast('记录保存成功！', 'success');
}

function editRecord(id) {
    const record = allRecords.find(r => r.id === id);
    if (!record) return;
    
    // Temporarily switch to original unit to show correct value
    const originalUnit = currentUnit;
    if (record.originalUnit !== currentUnit) {
        setUnit(record.originalUnit);
    }
    
    // Fill form
    document.getElementById('recordDate').value = record.date;
    document.getElementById('recordTime').value = record.time;
    document.getElementById('uricValue').value = record.originalValue;
    document.getElementById('notes').value = record.notes;
    
    // Add hidden field for update
    let updateIdField = document.getElementById('updateRecordId');
    if (!updateIdField) {
        updateIdField = document.createElement('input');
        updateIdField.type = 'hidden';
        updateIdField.id = 'updateRecordId';
        document.getElementById('recordForm').appendChild(updateIdField);
    }
    updateIdField.value = id;
    
    // Change button text
    const submitBtn = document.querySelector('#recordForm button[type="submit"]');
    submitBtn.textContent = '✏️ 更新记录';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        updateExistingRecord(id);
    };
    
    // Scroll to form
    document.querySelector('.input-section').scrollIntoView({ behavior: 'smooth' });
    
    // Restore unit after a short delay
    setTimeout(() => {
        if (originalUnit !== record.originalUnit) {
            setUnit(originalUnit);
        }
    }, 100);
}

function updateExistingRecord(id) {
    const date = document.getElementById('recordDate').value;
    const time = document.getElementById('recordTime').value;
    const value = parseFloat(document.getElementById('uricValue').value);
    const notes = document.getElementById('notes').value;
    
    if (!date || isNaN(value)) {
        showToast('请填写必填项', 'error');
        return;
    }
    
    const updatedData = {
        date,
        time,
        value: value,
        originalValue: value,
        originalUnit: currentUnit,
        notes
    };
    
    updateRecord(id, updatedData);
    
    // Reset form
    document.getElementById('recordForm').reset();
    document.getElementById('recordDate').valueAsDate = new Date();
    
    // Remove update field
    const updateIdField = document.getElementById('updateRecordId');
    if (updateIdField) updateIdField.remove();
    
    // Reset button
    const submitBtn = document.querySelector('#recordForm button[type="submit"]');
    submitBtn.textContent = '💾 保存记录';
    submitBtn.onclick = function(e) {
        saveRecord(e);
    };
    
    // Update UI
    updateStatistics();
    initChart();
    renderHistory();
    
    showToast('记录更新成功！', 'success');
}

// ================================
// Statistics
// ================================
function updateStatistics() {
    if (allRecords.length === 0) {
        document.getElementById('latestValue').textContent = '--';
        document.getElementById('avg7days').textContent = '--';
        document.getElementById('avg30days').textContent = '--';
        document.getElementById('totalRecords').textContent = '0';
        return;
    }
    
    // Sort by date descending
    const sortedRecords = [...allRecords].sort((a, b) => 
        new Date(b.date + (b.time ? 'T' + b.time : '')) - new Date(a.date + (a.time ? 'T' + a.time : ''))
    );
    
    // Latest value
    const latestValue = getRecordValue(sortedRecords[0]);
    const latestEl = document.getElementById('latestValue');
    latestEl.textContent = `${latestValue} ${currentUnit === UNIT_MGDL ? 'mg/dL' : 'μmol/L'}`;
    updateValueClass(latestEl, parseFloat(latestValue), currentUnit);
    
    // 7-day average
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekRecords = sortedRecords.filter(r => new Date(r.date) >= weekAgo);
    if (weekRecords.length > 0) {
        const weekValues = weekRecords.map(r => parseFloat(getRecordValue(r)));
        const weekAvg = (weekValues.reduce((a, b) => a + b, 0) / weekValues.length).toFixed(1);
        document.getElementById('avg7days').textContent = `${weekAvg} ${currentUnit === UNIT_MGDL ? 'mg/dL' : 'μmol/L'}`;
    } else {
        document.getElementById('avg7days').textContent = '--';
    }
    
    // 30-day average
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthRecords = sortedRecords.filter(r => new Date(r.date) >= monthAgo);
    if (monthRecords.length > 0) {
        const monthValues = monthRecords.map(r => parseFloat(getRecordValue(r)));
        const monthAvg = (monthValues.reduce((a, b) => a + b, 0) / monthValues.length).toFixed(1);
        document.getElementById('avg30days').textContent = `${monthAvg} ${currentUnit === UNIT_MGDL ? 'mg/dL' : 'μmol/L'}`;
    } else {
        document.getElementById('avg30days').textContent = '--';
    }
    
    // Total records
    document.getElementById('totalRecords').textContent = allRecords.length.toString();
}

function updateValueClass(element, value, unit) {
    element.classList.remove('normal', 'warning', 'danger');
    
    // Convert to mg/dL for comparison
    const mgdlValue = unit === UNIT_MGDL ? value : value * UMOL_TO_MGDL;
    
    if (mgdlValue <= RANGES.male.max) {
        element.classList.add('normal');
    } else if (mgdlValue <= RANGES.male.max + 1) {
        element.classList.add('warning');
    } else {
        element.classList.add('danger');
    }
}

// ================================
// Chart
// ================================
function initChart() {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    // Get data for chart range
    let chartRecords = [...allRecords];
    
    if (chartRange > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - chartRange);
        chartRecords = chartRecords.filter(r => new Date(r.date) >= startDate);
    }
    
    // Sort by date ascending for chart
    chartRecords.sort((a, b) => 
        new Date(a.date + (a.time ? 'T' + a.time : '')) - new Date(b.date + (b.time ? 'T' + b.time : ''))
    );
    
    // Prepare data
    const labels = chartRecords.map(r => {
        const date = new Date(r.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = chartRecords.map(r => parseFloat(getRecordValue(r)));
    
    // Destroy existing chart
    if (chart) {
        chart.destroy();
    }
    
    // Create new chart
    const ctx = canvas.getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `尿酸值 (${currentUnit === UNIT_MGDL ? 'mg/dL' : 'μmol/L'})`,
                data: data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `尿酸值: ${context.parsed.y} ${currentUnit === UNIT_MGDL ? 'mg/dL' : 'μmol/L'}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function setChartRange(days) {
    chartRange = days;
    
    // Update button states
    document.querySelectorAll('.chart-controls .btn-secondary').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Re-render chart
    initChart();
}

// ================================
// History
// ================================
function renderHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;
    
    let filteredRecords = [...allRecords];
    
    // Filter by search
    const searchTerm = document.getElementById('searchNotes')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredRecords = filteredRecords.filter(r => 
            r.notes.toLowerCase().includes(searchTerm) ||
            r.date.includes(searchTerm)
        );
    }
    
    // Sort
    const sortOrder = document.getElementById('historySort')?.value || 'desc';
    filteredRecords.sort((a, b) => {
        const dateA = new Date(a.date + (a.time ? 'T' + a.time : ''));
        const dateB = new Date(b.date + (b.time ? 'T' + b.time : ''));
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    // Paginate
    const startIndex = 0;
    const endIndex = currentPage * PAGE_SIZE;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    // Show/hide load more
    const loadMoreEl = document.getElementById('loadMore');
    if (loadMoreEl) {
        loadMoreEl.style.display = filteredRecords.length > endIndex ? 'block' : 'none';
    }
    
    // Render
    if (pageRecords.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>暂无记录，开始记录您的尿酸值吧！</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pageRecords.map(record => {
        const displayValue = getRecordValue(record);
        const mgdlValue = record.originalUnit === UNIT_MGDL ? record.originalValue : record.originalValue * UMOL_TO_MGDL;
        
        let valueClass = 'normal';
        if (mgdlValue > RANGES.male.max) valueClass = 'danger';
        else if (mgdlValue > RANGES.male.max - 0.5) valueClass = 'warning';
        
        const dateObj = new Date(record.date);
        const formattedDate = `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        
        return `
            <div class="history-item" data-id="${record.id}">
                <div class="date-time">
                    <span class="date">${formattedDate}</span>
                    <span class="time">${record.time || ''}</span>
                </div>
                <div class="value ${valueClass}">${displayValue} ${currentUnit === UNIT_MGDL ? 'mg/dL' : 'μmol/L'}</div>
                ${record.notes ? `<div class="notes">📝 ${escapeHtml(record.notes)}</div>` : ''}
                <div class="actions">
                    <button class="btn-edit" onclick="editRecord('${record.id}')">✏️ 编辑</button>
                    <button class="btn-delete" onclick="confirmDelete('${record.id}')">🗑️ 删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function filterHistory() {
    currentPage = 1;
    renderHistory();
}

function loadMoreHistory() {
    currentPage++;
    renderHistory();
}

function confirmDelete(id) {
    const record = allRecords.find(r => r.id === id);
    if (!record) return;
    
    showModal(
        '确认删除',
        `确定要删除 ${record.date} 的记录吗？此操作无法撤销。`,
        () => {
            deleteRecord(id);
            updateStatistics();
            initChart();
            renderHistory();
            showToast('记录已删除', 'success');
        }
    );
}

// ================================
// Export
// ================================
function exportData(format) {
    if (allRecords.length === 0) {
        showToast('暂无数据可导出', 'error');
        return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'csv') {
        // CSV header
        const headers = ['日期', '时间', '尿酸值(mg/dL)', '尿酸值(μmol/L)', '备注', '创建时间'];
        
        // CSV rows
        const rows = allRecords.map(r => {
            const mgdl = r.originalUnit === UNIT_MGDL ? r.originalValue : r.originalValue * UMOL_TO_MGDL;
            const umol = r.originalUnit === UNIT_UMOL ? r.originalValue : r.originalValue * MGDL_TO_UMOL;
            return [
                r.date,
                r.time || '',
                mgdl.toFixed(2),
                umol.toFixed(1),
                `"${(r.notes || '').replace(/"/g, '""')}"`,
                r.createdAt
            ].join(',');
        });
        
        content = [headers.join(','), ...rows].join('\n');
        filename = `uric_acid_records_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
    } else {
        // JSON format with converted values
        const exportData = allRecords.map(r => ({
            date: r.date,
            time: r.time || null,
            value_mg_dl: r.originalUnit === UNIT_MGDL ? r.originalValue : (r.originalValue * UMOL_TO_MGDL).toFixed(2),
            value_umol_l: r.originalUnit === UNIT_UMOL ? r.originalValue : (r.originalValue * MGDL_TO_UMOL).toFixed(1),
            notes: r.notes || null,
            createdAt: r.createdAt
        }));
        
        content = JSON.stringify(exportData, null, 2);
        filename = `uric_acid_records_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json;charset=utf-8;';
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`数据已导出为 ${format.toUpperCase()}`, 'success');
}

function confirmClearData() {
    if (allRecords.length === 0) {
        showToast('暂无数据可清除', 'error');
        return;
    }
    
    showModal(
        '清除所有数据',
        '确定要清除所有记录吗？此操作无法撤销！',
        () => {
            allRecords = [];
            saveData();
            updateStatistics();
            initChart();
            renderHistory();
            showToast('所有数据已清除', 'success');
        }
    );
}

// ================================
// UI Helpers
// ================================
function showModal(title, message, onConfirm) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalConfirm = document.getElementById('modalConfirm');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalConfirm.onclick = () => {
        closeModal();
        onConfirm();
    };
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    const banner = document.querySelector('.offline-banner');
    if (banner) {
        banner.classList.toggle('show', !isOnline);
    }
}

// ================================
// PWA Service Worker
// ================================
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
}

// Close modal on outside click
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
