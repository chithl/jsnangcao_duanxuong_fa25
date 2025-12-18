import { ReviewAPI } from "../../../api/ReviewAPI.js";

var ReviewModule = new ReviewAPI();
var params = new URLSearchParams(window.location.search);
var id = params.get("id");
var form = document.getElementById("edit-review");

(async () => {
    if (!id) {
        alert("Thiếu ID review");
        return;
    }

    var data = await ReviewModule.getOneReview(id);

    console.log(data);

    if (data) {
        document.getElementById("productId").value = data.productId ?? "";
        document.getElementById("reviewerName").value = data.reviewerName ?? "";
        document.getElementById("comment").value = data.comment ?? "";
        document.getElementById("status").value = String(data.status);
        document.getElementById("rating").value = data.rating ?? "";
    }
})();



form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        productId: document.getElementById("productId").value,
        reviewerName: document.getElementById("reviewerName").value,
        comment: document.getElementById("comment").value,
        status: Number(document.getElementById("status").value), 
        rating: document.getElementById("rating").value,
    };

    await ReviewModule.updateReview(id, data);

    alert("Cập nhật đánh giá thành công!");
    window.location.href = "review.html";
});

