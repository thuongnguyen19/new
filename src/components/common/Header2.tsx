import React from 'react'

const Header2 = () => {
  return (
    <div>
      <div className="tf-slideshow slider-effect-fade slider-skincare position-relative">
            <div className="swiper tf-sw-slideshow" data-preview="1" data-tablet="1" data-mobile="1" data-centered="false" data-space="0" data-loop="true" data-auto-play="false" data-delay="2000" data-speed="1000">
                <div className="swiper-wrapper">
                    <div className="swiper-slide" >
                        <div className="wrap-slider">
                            <img className="lazyload" data-src="images/slider/skincare-slide1.jpg" src="images/slider/skincare-slide1.jpg" alt="skincare-slideshow-01" loading="lazy"/>
                            <div className="box-content text-center">
                                <div className="container">
                                    <h1 className="fade-item fade-item-1 text-white heading">Skincare Reimagined.</h1>
                                    <p className="fade-item fade-item-2 text-white">To deliver peak potency, minus the waste</p>
                                    <a href="shop-collection-sub.html" className="fade-item fade-item-3 tf-btn btn-light-icon animate-hover-btn btn-xl radius-3"><span>Shop collection</span><i className="icon icon-arrow-right"></i></a> 
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="swiper-slide" >
                        <div className="wrap-slider">
                            <img className="lazyload" data-src="images/slider/skincare-slide2.jpg" src="images/slider/skincare-slide2.jpg" alt="skincare-slideshow-02" loading="lazy"/>
                            <div className="box-content text-center">
                                <div className="container">
                                    <h1 className="fade-item fade-item-1 text-white heading">Beauty in Every Drop</h1>
                                    <p className="fade-item fade-item-2 text-white">Indulge in the luxury of flawless skin</p>
                                    <a href="shop-collection-sub.html" className="fade-item fade-item-3 tf-btn btn-light-icon animate-hover-btn btn-xl radius-3"><span>Shop collection</span><i className="icon icon-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="swiper-slide" >
                        <div className="wrap-slider">
                            <img className="lazyload" data-src="images/slider/skincare-slide3.jpg" src="images/slider/skincare-slide3.jpg" alt="fashion-slideshow-03" loading="lazy"/>
                            <div className="box-content text-center">
                                <div className="container">
                                    <h1 className="fade-item fade-item-1 text-white">Skin Love, Unleashed</h1>
                                    <p className="fade-item fade-item-2 text-white">Experience the magic of self-care with our premium skincare</p>
                                    <a href="shop-collection-sub.html" className="fade-item fade-item-3 tf-btn btn-light-icon animate-hover-btn btn-xl radius-3"><span>Shop collection</span><i className="icon icon-arrow-right"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="wrap-pagination sw-absolute-3">
                <div className="sw-dots style-2 dots-white sw-pagination-slider justify-content-center"></div>
            </div>
        </div>
    </div>
  )
}

export default Header2