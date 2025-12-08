      $("#carousel-related-product").slick({
        infinite: true,
        arrows: false,
        slidesToShow: 4,
        slidesToScroll: 3,
        dots: true,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
            },
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 3,
            },
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 3,
            },
          },
        ],
      });

      // Script cho chức năng Đánh giá (Star Rating)
      $(document).ready(function () {
        $(".star-rating i").on("click", function () {
          const rating = $(this).data("rating");
          $("#selected-rating").val(rating);

          // Cập nhật giao diện sao
          $(".star-rating i").each(function () {
            const star_rating = $(this).data("rating");
            if (star_rating <= rating) {
              $(this)
                .removeClass("far text-secondary")
                .addClass("fa text-warning");
            } else {
              $(this)
                .removeClass("fa text-warning")
                .addClass("far text-secondary");
            }
          });
        });
      });