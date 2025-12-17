function selectMethod(method) {
    // reset trạng thái nút
    document.getElementById('btn-palette').classList.remove('bg-light');
    document.getElementById('btn-code').classList.remove('bg-light');
    document.getElementById('btn-picker').classList.remove('bg-light');

    // ẩn tất cả form
    document.getElementById('method-palette').classList.add('d-none');
    document.getElementById('method-code').classList.add('d-none');
    document.getElementById('method-picker').classList.add('d-none');

    // kích hoạt phương thức được chọn
    document.getElementById('btn-' + method).classList.add('bg-light');
    document.getElementById('method-' + method).classList.remove('d-none');
}
