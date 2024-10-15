import { FacebookOutlined, InstagramOutlined, PinterestOutlined, TikTokOutlined } from '@ant-design/icons'
import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer id="footer" className="footer md-pb-70">
            <div className="footer-wrap wow fadeIn" data-wow-delay="0s">
                <div className="footer-body">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-3 col-md-6 col-12">
                                <div className="footer-infor">
                                    <div className="footer-logo">
                                        <a href="index.html">
                                            <img src="images/logo/logo.svg" alt=""/>
                                        </a>
                                    </div>
                                    <ul>
                                        <li>
                                            <p>Địa chỉ:  Tòa nhà FPT Polytechnic, Phố Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
                                        </li>
                                        <li>
                                            <p>Email: <a href="#">info@fashionshop.com</a></p>
                                        </li>
                                        <li>
                                            <p>Số điện thoại: <a href="#">(212) 555-1234</a></p>
                                        </li>
                                    </ul>
                                    <ul className="tf-social-icon d-flex gap-10">
                                        <li><a href="#" className="box-icon w_34 round social-facebook social-line"><FacebookOutlined /></a></li>
                                        <li><a href="#" className="box-icon w_34 round social-instagram social-line"><InstagramOutlined /></a></li>
                                        <li><a href="#" className="box-icon w_34 round social-tiktok social-line"><TikTokOutlined /></a></li>
                                        <li><a href="#" className="box-icon w_34 round social-pinterest social-line"><PinterestOutlined /></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                                <div className="footer-heading footer-heading-desktop">
                                    <h6>Giúp đỡ</h6>
                                </div>
                                <div className="footer-heading footer-heading-moblie">
                                    <h6>Giúp đỡ</h6>
                                </div>
                                <ul className="footer-menu-list tf-collapse-content">
                                    <li>
                                        <a href="privacy-policy.html" className="footer-menu_item">Chính sách bảo mật</a>
                                    </li>
                                    
                                    <li> 
                                        <a href="shipping-delivery.html" className="footer-menu_item">Vận chuyển</a>
                                    </li>
                                    <li> 
                                        <a href="terms-conditions.html" className="footer-menu_item">Điều khiển &amp; Điều kiện</a>
                                    </li>
                                    <li> 
                                        <a href="faq-1.html" className="footer-menu_item">Câu hỏi thường gặp</a>
                                    </li>
                                    
                                    
                                </ul>
                            </div>
                            <div className="col-xl-3 col-md-6 col-12 footer-col-block">
                                <div className="footer-heading footer-heading-desktop">
                                    <h6>Về chúng tôi</h6>
                                </div>
                                <div className="footer-heading footer-heading-moblie">
                                    <h6>Về chúng tôi</h6>
                                </div>
                                <ul className="footer-menu-list tf-collapse-content">
                                    <li>
                                        <a href="about-us.html" className="footer-menu_item">Câu chuyện của chúng tôi</a>
                                    </li>
                                   
                                    <li> 
                                        <a href="contact-1.html" className="footer-menu_item">liên hệ</a>
                                    </li>
                                    <li> 
                                        <a href="login.html" className="footer-menu_item">Tài khoản</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="col-xl-3 col-md-6 col-12">
                                <div className="footer-newsletter footer-col-block">
                                    <div className="footer-heading footer-heading-desktop">
                                        <h6>Đăng ký nhận Email</h6>
                                    </div>
                                    <div className="footer-heading footer-heading-moblie">
                                        <h6>Đăng ký nhận Email</h6>
                                    </div>
                                    <div className="tf-collapse-content">
                                        <div className="footer-menu_item">Đăng ký để được ưu tiên nhận thông tin về hàng mới về, chương trình khuyến mại, nội dung độc quyền, sự kiện và nhiều hơn nữa!</div>
                                        <form className="form-newsletter" id="subscribe-form" action="#" method="post" acceptCharset="utf-8" data-mailchimp="true">
                                            <div id="subscribe-content">
                                                <fieldset className="email">
                                                    <input type="email" name="email-form" id="subscribe-email" placeholder="Nhập email của bạn...."  aria-required="true"/>
                                                </fieldset>
                                                <div className="button-submit">
                                                    <button id="subscribe-button" className="tf-btn btn-sm radius-3 btn-fill btn-icon animate-hover-btn" type="button">Đăng ký<i className="icon icon-arrow1-top-left"></i></button>
                                                </div>
                                            </div>
                                            <div id="subscribe-msg"></div>
                                        </form>
                                        <div className="tf-cur">
                                            <div className="tf-currencies">
                                                <select className="image-select center style-default type-currencies">
                                                    <option data-thumbnail="images/country/fr.svg">EUR € | Pháp</option>
                                                    <option data-thumbnail="images/country/de.svg">EUR € | Đức</option>
                                                    <option selected data-thumbnail="images/country/us.svg">USD $ | Mỹ</option>
                                                    <option data-thumbnail="images/country/vn.svg">VND ₫ | Việt Nam</option>
                                                </select>
                                            </div>
                                            <div className="tf-languages">
                                                <select className="image-select center style-default type-languages">
                                                    <option>English</option>
                                                    <option>العربية</option>
                                                    <option>简体中文</option>
                                                    <option>اردو</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="container">
                        <div className="row">
                            <div className="col-12">
                                <div className="footer-bottom-wrap d-flex gap-20 flex-wrap justify-content-between align-items-center">
                                    <div className="footer-menu_item">© 2024 Ecomus Store. All Rights Reserved</div>
                                    <div className="tf-payment">
                                        <img src="images/payments/visa.png" alt=""/>
                                        <img src="images/payments/img-1.png" alt=""/>
                                        <img src="images/payments/img-2.png" alt=""/>
                                        <img src="images/payments/img-3.png" alt=""/>
                                        <img src="images/payments/img-4.png" alt=""/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
  )
}

export default Footer