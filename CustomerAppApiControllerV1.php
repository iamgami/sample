<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Http\Requests;
use FCM;
use Auth;
use Mail;
use Config;
use App\City;
use App\Driver;
use App\Customer;
use App\Booking;
use App\VehicleCategory;
use App\CancelBooking;
use App\AllotedBooking;
use App\CancellationReason;
use App\DriverOnBoarding;
use App\GoodsType;
use App\CustomerGoodsMeta;
use App\Rating;
use App\CustomerAppDownload;
use App\CustomerComplaint;
use App\CustomerInfo;
use App\AverageRating;
use App\CustomerLedger;
use App\FavoriteLocation;
use App\CustomerCreditLimit;
use App\CustomerDropPoints;
use App\FavoriteLocationCustomer;
use App\Referral;
use App\ReferralDetails;
use App\DashboardNotification;
use App\BookingStatus;
use App\BookingCurrentStatus;
use App\BookingAlert;
use App\BookingRemarks;
use PushNotification;
use App\DriverRegular;
use App\Http\Controllers\Controller;
use LaravelFCM\Message\OptionsBuilder;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
use App\MaalgaadiSetting;
use App\MaalgaadiSettings;
use App\CustomerSetting;
use Stichoza\GoogleTranslate\TranslateClient;
use App\SurgeSetting;
use App\BookingSurge;
use App\CreditLimit;
use App\EmployeeAllotment;
use App\FavouriteDriver;
use App\CustomerRating;
use App\FixedBooking;
use App\RatingReason;
use App\BookingDiscountCode;
use App\DiscountCouponCode;
use App\BookingCustomerDetails;
use App\BookingDriverDetails;
use App\VehicleGood;
use App\BillingType;
use App\ErrorMessages;
use App\DriverDetials;
use App\CustomerNotification;
use App\ComplaintType;
use App\SubComplaintType;
use App\Complaint;
use DB;
use App\DriverUpdate;
use App\AutoAllotedTemp;
use App\AutomaticAllotment;
use App\DriverRoute;
use App\BookingSurgeParameter;
use App\TipCharge;
use App\BookingEta;
use App\CustomerOrder;
use App\DriverIncompleteTrip;
use App\DriverCancelLocation;
use App\DriverPrimeSetting;
use App\BookingWaitTimeRange;


class CustomerAppApiControllerV1 extends Controller
{
    
    # Function : This function is  used Stor info about who is download app 
    # Request : Token and Device ID
    # Response : Json message
    # Autor : Brijendra 
    # Modify : Vinod Kumar 
    public function appDownloads(Request $request)
    {
        $data = $request->all();
        if(isset($data['token']) && isset($data['device_id']))
        {
            $device_id = $data['device_id'];
            $token     = $data['token'];
            $check = CustomerAppDownload::where('device_id', $device_id)->first();
            if ($check != '') 
            {   
                $date = date('Y-m-d H:i:s');
                if($check['start_date'] == '')
                {
                    $check->installation_date = $date;
                }  
                $check->device_token = $token;
                $check->save();
                $response['success'] = true;
                $response['message'] = "Information successfully updated.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {   
                $date = date('Y-m-d H:i:s');
                $download  = new CustomerAppDownload;
                $download->device_id        = $device_id;
                $download->device_token     = $token;
                $download->installation_date = $date;
                $download->save();
                
                $response['success'] = true;
                $response['message'] = "Information successfully added.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Token or device Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function is  used Stor info about who is download app 
    # Request : Token and Device ID
    # Response : Json message
    # Autor : Brijendra 
    # Modify : Vinod Kumar, Rahul Patidar

    public function login(Request $request)
    {
        $data     = $request->all();
        $email    = NULL;
        $password = NULL;
        $rating   = 5;

        //customer email check
        if(isset($data['customer_phone']))
        {
            $customerPhone = $data['customer_phone'];
        }
        else if(isset($data['customer_email']))
        {
            $email = $data['customer_email'];   
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer mobile number and e-mail id is required..";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['customer_password']) && $data['customer_password'] != '')
        {
            $password = $data['customer_password'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer password is required.";
            $response['data']    = (object) array();
            return $response;
        }

        $password = md5($password);
        $customerDetials = NULL;
        if($email != NULL)
        {
            $customerDetials = Customer::where('cust_email', $email)->where('password', $password)->first();    
        }
        else if ($customerPhone != NULL) 
        {
            $customerDetials = Customer::where('cust_number', $customerPhone)->where('password', $password)->first();    
        }
        
        if($customerDetials != '')
        {
            $customerId = $customerDetials->id;
            $goodsId = $customerDetials->goods_id;
            if($goodsId)
            {
                $goodsDetails = GoodsType::find($goodsId);
                if($goodsDetails != '' && $goodsDetails->goods_name != 'Others')
                {
                    $customerDetials->goods_name = $goodsDetails->goods_name;
                }
                else
                {
                    $customerDetials->goods_name = $customerDetials->other_goods;
                }
            }
            else
            {
                $customerDetials->goods_name = '';
            }
            
            $creditLimit = CreditLimit::select('credit_limit')->where('customer_id', $customerId)->orderBy('id', 'DESC')->first();
            if($creditLimit)
            {
                $customerDetials->credit_limit = $creditLimit->credit_limit;
            }
            else
            {
                $customerDetials->credit_limit = 0;
            }

            $rating = $this->_getCustomerAverageRating($customerDetials->id);
            $customerDetials->rating = $rating;
            unset($customerDetials->other_goods);
            if($customerDetials->cust_name == 'NA')
            {
                $customerDetials->cust_name = '';
            }
            if($customerDetials->cust_organization == 'NA')
            {
                $customerDetials->cust_organization = '';
            }
            if($customerDetials->cust_email == 'NA')
            {
                $customerDetials->cust_email = '';
            }
            if($customerDetials->cust_address == 'NA')
            {
                $customerDetials->cust_address = '';
            }
            if($customerDetials->status == 'inactive')
            {
                $response['success'] = false;
                $response['message'] = "This user account has been temporarily suspended. Please contact MaalGaadi for further assistance.";
                $response['data']    = (object) array();
                return $response;
            }
            $getResponse = $this->_updateCustomerDeviceInfo($data,'login');
            $customerDetials->access_token = $getResponse['access_token'];
            $getSetting = MaalgaadiSettings::select('buffered_schedule_time','allowed_drop_point','max_allow_distance','customer_allowed_favourite_driver','max_tip_charge','app_allow_tab','customer_care_contact')->where('city_id',$customerDetials->city_id)->first();
            $customerDetials->configure_setting = $getSetting;
            $getSettingApp = json_decode($getSetting->app_allow_tab,true);

            $customerDetials->configure_setting->app_allow_tab = $getSettingApp[0];
            if(isset($customerDetials->city_id))
            {
                $cityId = $customerDetials->city_id;
            }
            else
            {
                $cityId = 1;
            }

            $customerDetials->configure_setting->tip_array = $this->_getTipCharges($cityId);
            $customerDetials->configure_setting->waiting_array = $this->_getBookingWaitingTimeRange($cityId);
            //$customerDetials->configure_setting->tip_array = array(10, 20, 30, 40, 50);
            // $customerDetials->configure_setting->waiting_array = array(0.5,1,1.5, 2, 3, 4, 5);
            $customerDetials->configure_setting->trip_frequency = array('5 trips a month','30 trips a month','60 trips a month','More than 60 trips');
            $customerDetials->configure_setting->customer_care_number = $getSetting->customer_care_contact;
            $getCity = City::get();
            $getSetting->city_list = $getCity;
            $response['success'] = true;
            $response['message'] = "Login successful.";
            $response['data']    = $customerDetials;
            return $response;
        }
        else
        {
            $customerDetials = Customer::where('cust_number', $customerPhone)->first();   
            if($customerDetials == "")
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
            else if($customerDetials != "")
            {
                $response['success'] = false;
                $response['message'] = "Incorrect password.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Incorrect password.";
                $response['data']    = (object) array();
                return $response;
            }
        }
    }

    # Function : This function is used store FCm Token
    # Request :  Device ID
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar

    public function logout(Request $request) 
    {
        $data     = $request->all();
        if (isset($data['device_id'])) 
        {
            $customerId      = $data['customer_id'];
            $customerDetail  = Customer::where('id', $customerId)->first();
            if ($customerDetail != '') 
            {
                $customerDevice = CustomerInfo::where('device_id', $data['device_id'])->first();
                if($customerDevice != '')
                {
                    $customerDevice->device_id    = $data['device_id'];
                    $customerDevice->customer_id = $customerDetail->id;
                    $customerDevice->app_version = '2';
                    $customerDevice->logout_time = date('Y-m-d H:i:s');
                    $customerDevice->access_token = '';
                    $customerDevice->save();
                }
                $response['success'] = true;
                $response['message'] = "Logout successful.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Device Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }
    

    # Function : This function is used store FCm Token
    # Request :  Device ID
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar

    public function fcmToken($deviceId)
    {
        $customerAppDownload = CustomerAppDownload::where('device_id', $deviceId)->first();
        $deviceToken         = $customerAppDownload->device_token;
        $customerInfo        = CustomerInfo::where('device_id', $deviceId)->orderBy('id', 'desc')->first();
        $customerInfo->device_token = $deviceToken;
        $customerInfo->save();
        return $customerInfo;

    }

    # Function : This function is used Check Access token is valid or not
    # Request :  Device ID
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar

    public function _checkAccessToken()
    {
        $header = getallheaders();
        //$accessToken = $header['access_token'];
        if(isset($header['key']))
        {
            $key = $header['key'];
        }
        else
        {
            $key = '';
        }
        
        if($key == '21db33e221e41d37e27094153b8a8a02')
        {
            return true;
            // $customerDevice = CustomerInfo::where('access_token', $accessToken)->first();
            // if($customerDevice == '')
            // {
            //     return false;
            // }
            // else
            // {
            //     return true;
            // }
        }
        else
        {
            return false;
        }
    }

    # Function : This function is used store FCm Token
    # Request :  Device ID
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar

    public function _updateCustomerDeviceInfo($data,$type)
    {
        
        if (isset($data['device_id'])) 
        {
            $phone      = $data['customer_phone'];
            $customerDetail  = Customer::where('cust_number', $phone)->first();
            if ($customerDetail != '') 
            {
                $accessToken = md5(uniqid(rand(), true));
                $customerDevice = CustomerInfo::where('device_id', $data['device_id'])->first();
                if($customerDevice != '')
                {
                    $customerDevice->login_time   = date('Y-m-d H:i:s');
                    $customerDevice->device_id    = $data['device_id'];
                    $customerDevice->device_token    = $data['device_fcm_token'];
                    $customerDevice->customer_id = $customerDetail->id;
                    $customerDevice->app_version = '2';
                    $customerDevice->logout_time = NULL;
                    $customerDevice->access_token = $accessToken;
                    $customerDevice->save();
                }
                else
                {   
                    $customerDevice = new CustomerInfo;
                    $customerDevice->login_time   = date('Y-m-d H:i:s');
                    $customerDevice->device_id    = $data['device_id'];
                    $customerDevice->device_token    = $data['device_fcm_token'];
                    $customerDevice->customer_id = $customerDetail->id;
                    $customerDevice->app_version = '2';
                    $customerDevice->logout_time = NULL;
                    $customerDevice->app_install_date  = date('Y-m-d H:i:s');
                    $customerDevice->access_token = $accessToken;
                    $customerDevice->save();
                }
                $response['success'] = true;
                $response['message'] = "Login successful.";
                $response['data']    = (object) array();
                $response['access_token'] = $accessToken;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        
    }
 
    # Function : This function is used store FCm Token
    # Request :  Device ID
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar, Rahul Patidar

    public function updateCustomerProfile(Request $request)
    {  
      
        $data     = $request->all();
        $result   = array();
    
        if(isset($data['customer_id']))
        {
            $id = $data['customer_id'];
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    
        $profile  = Customer::find($id);
    
        if(isset($profile) == NULL)
        {
            $response['success'] = false;
            $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
            $response['data']    = (object) array();
            return $response;
        }
    
        if(isset($data['name']))
        {
            $profile->cust_name = $data['name'];
        }
    
        if(isset($data['email']))
        {
            $profile->cust_email = $data['email'];
        }
    
        if(isset($data['number']))
        {
            $profile->cust_number = $data['number'];
        }
    
        if(isset($data['organization']))
        {
            $profile->cust_organization = $data['organization'];
        }
    
        if(isset($data['address']))
        {
            $profile->cust_address = $data['address'];
        }
        if(isset($data['selected_trip_frequency']))
        {
            $profile->selected_trip_frequency = $data['selected_trip_frequency'];
        }
        $goodsName = '';
        if(isset($data['goods_id']))
        {
            $goodsId = $data['goods_id'];
            if($goodsId)
            {
                $goodsName = $data['goods_name'];
                $goodsDetails = GoodsType::find($goodsId);
                if($goodsDetails)
                {
                    if($goodsDetails->goods_name == 'Others')
                    {
                        $profile->other_goods = $data['goods_name'];
                    }
                }
            }
            $profile->goods_id = $data['goods_id'];
        }
        if(isset($data['trip_code']))
        {
            $profile->trip_code = $data['trip_code'];
        }

        $profile->save();
        $creditLimit = CreditLimit::select('credit_limit')->where('customer_id', $id)->orderBy('id', 'DESC')->first();
        if($creditLimit)
        {
            $profile->credit_limit = $creditLimit->credit_limit;
        }
        else
        {
            $profile->credit_limit = 0;
        }
        $rating = $this->_getCustomerAverageRating($id);
        $profile->rating = $rating;
        $profile->goods_name = $goodsName;
        unset($profile->other_goods);
        $response['success'] = true;
        $response['message'] = "Profile update successfully.";
        $response['data']    = $profile;
        return $response;
    
    }//End updateCustomerProfile function

    # Function : This function is used update the customer password 
    # Request :  Phone & password
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar
    public function customerForgotPassword(Request $request)
    {
        $data = $request->all();
        if(isset($data['phone']) && isset($data['password']))
        {
            $phone                          = $data['phone'];
            $password                       = $data['password'];
            $customerDetials                = Customer::select('id','cust_number','cust_name','cust_email','cust_address','password')->where('cust_number', $phone)->first();
            
            if($customerDetials != "")
            {
                $customerDetials->password = md5($password);
                $customerDetials->save();
                $response['success'] = true;
                $response['message'] = "Password has been set.";
                $response['data']    = $customerDetials;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer mobile number is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function is used Send OTP to customer mobile
    # Request :  Phone 
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar
    
    public function customerSignUp(Request $request)
    {
        $data = $request->all();
        if(isset($data['phone']))
        {
            $phone  = $data['phone'];
            $check  = Customer::where('cust_number', $phone)->first();
            if($check!='')
            {
                $response['success'] = false;
                $response['message'] = "This mobile number is already registered with us.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $result                      = $this->_customerVerification($phone);
                $response['success'] = true;
                $response['message'] = "OTP succesfully generated.";
                $response['data']    =  (object) array('otp' => $result);
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Required parameters are missing.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function is used for update new customer information
    # Request :  Phone , password , lat , lng
    # Response : Json message 
    # Autor : Brijendra 
    # Modify : Vinod Kumar
    public function updateNewCustomer(Request $request)
    {
        $data = $request->all();
        if(isset($data['phone']) && $data['phone'] != '' &&  isset($data['password']) && $data['password'] != '')
        {
            $phone        = $data['phone'];
            $password     = $data['password'];
            $lat          = $data['lat'];
            $lng          = $data['lng'];
            $cityId       = '';
            $data['customer_phone'] = $phone;
            if($lat != '' && $lng != '' && $lat != '0.0' && $lng != '0.0')
            {
                $cityId = $this->_getPlaceName($lat, $lng);
            }
            else
            {
                $cityId = 1;
            }
            if($cityId == '')
            {
                $response['success'] = false;
                $response['message'] = "The selected location is out of our service area.";
                $response['data']    = (object) array();
                return $response;
            }
            if($data['phone'] != '')
            {
                $checkCustomer = Customer::where('cust_number',$phone)->first();
                if($checkCustomer != '')
                {
                    $response['success'] = false;
                    $response['message'] = "This mobile number is already registered with us.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            $referralCode = isset($data['referral_code']) ? $data['referral_code'] : '';
            $customer                         = new Customer;
            $customer->cust_number            = $phone;
            $customer->cust_name              = "";
            $customer->cust_email             = "";    
            $customer->cust_address           = "";
            $customer->password               = md5($password);
            $customer->cust_organization      = "";
            $customer->cust_business_product  = '0';
            $customer->employee_id            = 44;
            $customer->city_id                = $cityId;
            $customer->cust_discount_percent  = 0;
            $customer->cust_pricing_module_id = 0;
            $customer->cluster_number         = 0;
            $customer->trip_code              = '';
            $customer->remember               = '';
            $customer->status                 = 'active';
            $customer->email_token            = '';
            $customer->device_id              = '';
            $customer->device_token           = '';
            $customer->customer_otp           = 0;
            $customer->remember_token         = '';
            $customer->referral_code          = $referralCode;
            $customer->save();

            if(isset($data['device_id']) && isset($data['device_fcm_token']))
            {
                $deviceToken = new CustomerAppDownload;
                $deviceToken->device_id    = $data['device_id'];
                $deviceToken->device_token = $data['device_fcm_token'];
                $deviceToken->installation_date = date('Y-m-d H:i:s');
                $deviceToken->save();
            }
            
            if ($customer != '') 
            {
                $specialFunction = new CommonFunctionController;
                $settingDetails  = $specialFunction->addCustomerInToSetting($customer->id);
            }
            
            $getResponse = $this->_updateCustomerDeviceInfo($data,'login');
            $customer->access_token = $getResponse['access_token'];
            if(isset($customer->city_id))
            {
                $cityId = $customer->city_id;
            }
            else
            {
                $cityId = 1;
            }

            $getSetting = MaalgaadiSettings::select('buffered_schedule_time','allowed_drop_point','max_allow_distance','customer_allowed_favourite_driver','max_tip_charge','app_allow_tab','customer_care_contact')->where('city_id',$cityId)->first();
            $customer->configure_setting = $getSetting;
            $getSettingApp = json_decode($getSetting->app_allow_tab,true);

            $customer->configure_setting->app_allow_tab = $getSettingApp[0];
            $customer->configure_setting->tip_array = $this->_getTipCharges($cityId);
            $customer->configure_setting->waiting_array = $this->_getBookingWaitingTimeRange($cityId);
            //$customer->configure_setting->tip_array = array(10, 20, 30, 40, 50);
            // $customer->configure_setting->waiting_array = array(0.5, 1,1.5, 2, 3, 4, 5);
            $customer->configure_setting->trip_frequency = array('5 trips a month','30 trips a month','60 trips a month','More than 60 trips');
            $customer->configure_setting->customer_care_number = $getSetting->customer_care_contact;
            $getCity = City::get();
            $getSetting->city_list = $getCity;
            $rating = $this->_getCustomerAverageRating($customer->id);
            $customer->rating = $rating;

            $response['success'] = true;
            $response['message'] = "Customer signup successful.";
            $response['data']    = $customer;
            return $response;
            
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer mobile number and password is required.";
            $response['data']    = (object) array();
            return $response;
        }

    }

    # Function : This function used for Get city id by lat & lng
    # Request : Booking Id
    # Response : Success messages with data 
    # Autor : Brijendra
    # Modify By : Vinod Kumar
    public function _getPlaceName($latitude, $longitude)
    {
        $auto = new AutoAllotBookingController;
        $getCity = City::all();
        $setArrayWithDistance =  array();
        foreach ($getCity as $key => $value)
        {
            $getSettings = MaalgaadiSettings::where('city_id',$value->id)->first();
            $radius = $auto->getRadiantdistance($latitude, $longitude, $value->lat, $value->lng);
            $radius = $radius/1000;
            if($getSettings != '')
            {
                if($getSettings->max_allow_distance >= $radius )
                {
                    $setArrayWithDistance[$key] = array('city_id' => $value->id , 'distance' => $radius);
                }
            }
        }
        $this->array_sort_by_column($setArrayWithDistance, 'distance');
        if(!empty($setArrayWithDistance))
        {
            return $setArrayWithDistance[0]['city_id'];
        }
        else
        {
            return '';
        }
    }

    # Function : This function used for Sort Array
    # Request : Array
    # Response : Array
    # Autor : Brijendra
    # Modify By : Vinod Kumar
    public function array_sort_by_column(&$arr, $col, $dir = SORT_ASC) 
    {
        $sort_col = array();
        foreach ($arr as $key=> $row) 
        {
            $sort_col[$key] = $row[$col];
        }
        array_multisort($sort_col, $dir, $arr);
    }

    # Function : This function used for cancellation distance
    # Request : Booking Id
    # Response : Success messages with data 
    # Autor : Brijendra
    # Modify By : Vinod Kumar
    public function updateCancelationDistance(Request $request)
    {
        $data               = $request->all();
        $bookingId          = NULL;
        $distanceToCustomer = NULL;
        $tripDistance       = NULL;
        if(isset($data['booking_id']))
        {
            //distance to customer
            if(isset($data['distance_to_customer']))
            {   
                $distanceToCustomer = $data['distance_to_customer'];
            }
            else
            {
                $distanceToCustomer = 0;
            }
            //Trip Distance
            if(isset($data['trip_distance']))
            {   
                $tripDistance = $data['trip_distance'];
            }
            else
            {
                $tripDistance = 0;
            }

            $bookingId    = $data['booking_id'];
            $bookingFinal = Booking::where('booking_id', $bookingId)->first();
            if($bookingFinal != '')
            {
                $bookingFinal->distance_to_customer = $distanceToCustomer;
                $bookingFinal->upper_trip_distance = $tripDistance;
                $bookingFinal->save();

                $response['success'] = true;
                $response['message'] = "Distance has been updated.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Booking Id does not exist.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Required parameters are missing.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used verify valid customer mobile number
    # Request : Customer email & password
    # Response : One Time Password
    # Autor : Brijendra
    # Modify By : Vinod Kumar
    public function _customerVerification($phone)
    {
        $otpCode = rand(11111,99999);
        
        //Your authentication key
        $authKey = "85262ARwrcvP1i7555eec59";

        //Sender ID,While using route4 sender id should be 6 characters long.
        $senderId = "MLGADI";

        //Your message to send, Add URL encoding here.
        $message = urlencode('Welcome to MaalGaadi your OTP for registration is, MG: '.$otpCode);

        //Define route 
        $route = "4";
        //Prepare you post parameters
        $postData = array(
            'authkey' => $authKey,
            'mobiles' => $phone,
            // 'mobiles' => "9685736799",
            'message' => $message,
            'sender'  => $senderId,
            'route'   => $route
        );

        //API URL
        $url = "http://vtermination.com/sendhttp.php";

        // init the resource
        $ch = curl_init();
        curl_setopt_array($ch, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postData
            //,CURLOPT_FOLLOWLOCATION => true
        ));


        //Ignore SSL certificate verification
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);


        //get response
        $output = curl_exec($ch);

        //Print error if any
        if(curl_errno($ch))
        {
            $array['error'] = array();
            $array['error']['message'] = "OTP sending has failed.";
            return $array;
        }

        curl_close($ch);
        return $otpCode;
    }

    # Function : This function used Update Password 
    # Request : Customer email & password
    # Response : Success messages with data 
    # Autor : Brijendra
    # Modify By : Vinod Kumar

    public function updateUserPasswordForDashboard(Request $request)
    {
        $data            = $request->all();
        $cust_number     = NULL;
        $cust_email      = NULL;
        $customerDetials = NULL;

        if(isset($data['cust_email']))
        {
            $cust_email = $data['cust_email'];

            if(isset($data['password']))
            {
                $password = $data['password'];
            }

            $customerDetials  = Customer::where('cust_email', $cust_email)->first(); 
            if ($cust_email === '') 
            { 
                if(isset($data['cust_number']))
                {
                    $cust_number = $data['cust_number'];

                    $customerDetials  = Customer::where('cust_number', $cust_number)->first();
                }                
            }
            if($customerDetials != "")
            {
                $customerDetials->password = md5($password);
                $customerDetials->save();
                
                $response['success'] = true;
                $response['message'] = "Password has been set.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Required parameters are missing.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for get vehicle Details
    # Request : Customer id
    # Response : Success messages with data 
    # Autor : Brijendra
    # Modify By : Vinod Kumar

    public function getVehicleDetials(Request $request)
    {
        $data = $request->all();
        $response = array();
        // if($this->_checkAccessToken() == false)
        // {
        //     $response['success'] = false;
        //     $response['message'] = "401 unauthorized access is denied due to invalid request.";
        //     $response['data']    = (object) array();
        //     return $response;
        // }
        $vehicleSetArray = array();
        $cityId = 1;
        $query = VehicleCategory::where('delete_status','','0');
        $cityId = isset($data['city_id']) ? $data['city_id'] : 1;
        if(isset($cityId))
        {
            $query->where('city_id', $cityId);
        }
        
        $vehicleDetials = $query->orderBy('sequence')->get();


        foreach ($vehicleDetials as $key => $value) 
        {
            if(!isset($vehicleSetArray[$value->id]))
            {
                $vehicleSetArray[$value->id] = $value;
            }
            $getGoods =  VehicleGood::select('good_id')->where('vehicle_id',$value->id)->get();
            $goodsIdsArray = array();
            foreach ($getGoods as $key => $val) 
            {
                array_push($goodsIdsArray, $val->good_id);
            }
            $value->allow_goods = $goodsIdsArray;
            $otherServices = false;
            if($value->allow_loading == '1' || $value->allow_unloading == '1' || $value->allow_covered == '1')
            {
                $otherServices = true;
            }
            $value->other_services = $otherServices;
        }
        $customerDetials = (object) array();
        $creditLimit = $this->customerCredit($data['customer_id']);
        $getSetting = MaalgaadiSettings::select('buffered_schedule_time','allowed_drop_point','max_allow_distance','customer_allowed_favourite_driver','max_tip_charge','app_allow_tab','customer_care_contact')->where('city_id',$cityId)->first();

        $customerDetials = $getSetting;
        $getSettingApp = json_decode($getSetting->app_allow_tab,true);

        $customerDetials->app_allow_tab = $getSettingApp[0];
        if(isset($customerDetials->city_id))
        {
            $cityId = $customerDetials->city_id;
        }
        else
        {
            $cityId = 1;
        }

        $customerDetials->tip_array = $this->_getTipCharges($cityId);
        $customerDetials->waiting_array = $this->_getBookingWaitingTimeRange($cityId);
        $customerDetials->trip_frequency = array('5 trips a month','30 trips a month','60 trips a month','More than 60 trips');
        $customerDetials->customer_care_number = $getSetting->customer_care_contact;
        
        $getCity = City::get();
        $customerDetials->city_list = $getCity;
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
            $customerData = Customer::find($data['customer_id']);
            $customerData->city_id = $cityId;
            $customerData->save();
        }
        if(!empty($vehicleDetials))
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $vehicleDetials;
            $response['credit_limit'] = intval($creditLimit);
            $response['configure_setting'] = $customerDetials;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;
        }
        
    }

    # Function : This function used for get all running booking deatils of customer id
    # Request : Customer id
    # Response : Success messages with data 
    # Autor : Brijendra
    # Modify By : Vinod Kumar

    public function getCustomerWalletDetials(Request $request)
    {
        $data = $request->all();
        
        if(isset($data['phone']))
        {
            $phone               = $data['phone'];
            $customerDetials     = Customer::where('cust_number', $phone)->first();
            $customerWallet      = CustomerLedger::where('customer_id', $customerDetials->id)->orderBy('id', 'desc')->paginate(10);
            $customerWalletArray = array();
            $bookingIdArray      = array();
            $i                   = 0;
            $temp                = 0;

            $arrayCount = count($customerWallet);
            $i = 0;
            foreach ($customerWallet as $key => $value) 
            {
                if(isset($customerWallet[$i + 1]))
                {
                    $value['mg_money'] = $customerWallet[$i + 1]->final_balance;    
                }
                else
                {
                    $value['mg_money']  = 0;   
                }
                $i++;

                array_push($bookingIdArray, $value->booking_id);
            }
            // return $customerWallet;
            $favoriteLocationDetials = FavoriteLocation::whereIn('booking_id', $bookingIdArray)->get();
            $favoriteLocationArray   = array();
            foreach ($favoriteLocationDetials as $key => $value) 
            {
                if(!isset($favoriteLocationArray[$value->booking_id]))
                {
                    $favoriteLocationArray[$value->booking_id] = $value;  
                }
            }


            $temp = 0;
            // return $customerWallet;
            $mainResultArray = array();
            foreach ($customerWallet as $key => $value) 
            {
                if($value != "")
                {
                   $value['created']        = date('d-m-Y H:i:s', strtotime($value->created_at));
                }
                else
                {
                    $value['created']       = 'NA';
                }

                $bookingDetails = Booking::where('id', $value->booking_id)->first();
                $vehicleDetials = VehicleCategory::where('id', $bookingDetails['vehicle_id'])->first();

                if($bookingDetails == '' && $value->booking_id != 0)
                {
                    if ($vehicleDetials != '') 
                    {
                        $value['vehicle_name']  = $vehicleDetials->vehicle_name;
                    }
                    else
                    {
                        $value['vehicle_name']  = 'NA';
                    }

                    if($bookingDetails->upper_trip_distance)
                    {
                        $value['trip_distance']   = ($bookingDetails->upper_trip_distance)/1000;
                    }
                    else
                    {
                        $value['trip_distance']   = 'NA';
                    }

                    if(isset($favoriteLocationArray[$value->booking_id]))
                    {
                        $value['pickup_landmark'] = $favoriteLocationArray[$value->booking_id]['pickup_location'];
                        $value['drop_landmark']   = $favoriteLocationArray[$value->booking_id]['drop_location'];
                    }
                    else
                    {
                        $value['pickup_landmark'] = 'NA';
                        $value['drop_landmark']   = 'NA';
                    }
                }
                else
                {
                    $value['vehicle_name'] = '';
                    $value['trip_distance'] = '';
                    $value['pickup_landmark'] = 'NA';
                    $value['drop_landmark'] = 'NA';
                }
                if($value->booking_id != 0 )
                {
                    $value['entry_type'] = 1;
                }
                else if($value->booking_id == 0 &&  $value->remark != 'Amount received online')
                {
                    $value['entry_type'] = 2;
                }
                else
                {
                    $value['entry_type'] = 3;
                }
                
                $customerpost         = CustomerLedger::select('id', 'final_balance')->where('booking_id', $value->booking_id)->where('customer_id',$customerDetials->id)->first();
                if ($customerpost != '') 
                {
                    if (isset($customerpost->final_balance)) 
                    {
                        $value['mg_balance']   = $customerpost->final_balance;
                        $temp                  = $customerpost->final_balance;  
                    }
                    else
                    {
                        $value['mg_balance']   = 0;                
                        $temp                  = 0;
                    }
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "No record found..";
                    $response['data']    = (object) array();
                    return $response;
                }
                array_push($mainResultArray, $value);
            }

            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $mainResultArray;
            $response['totalPage'] = $customerWallet->lastPage();
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Required parameters are missing.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for get all running booking deatils of customer id
    # Request : Customer id
    # Response : Success messages with data 
    # Autor : Brijendra
    # Modify By : Vinod Kumar
    public function getCustomerRunningBooking(Request $request)
    {
        $data     = $request->all();
        $result   = array();
        $customerId = NULL;
  
        if(isset($data['customer_id']))
        {
            $customerId         = $data['customer_id'];
            if($customerId != "")
            {     
                //fetching bookings details
                $sixDays = date('Y-m-d H:i:s',strtotime('-6 days'));
                $bookingDetails = Booking::where('driver_id', '!=' ,'-1')->where('customer_id', $customerId)->where('requirement_time', '>', $sixDays)->orderBy('id', 'desc')->paginate(10);
                $driverIdArray  = array();
                $bookingIdArray = array();
                $vehicleIdArray = array();
                // return $bookingDetails;
                foreach ($bookingDetails as $key => $value) 
                {
                    array_push($driverIdArray, $value->driver_id);
                    array_push($bookingIdArray, $value->id);
                    array_push($vehicleIdArray, $value->vehicle_id);
                }
                $driverDetailsArray = Driver::select('id', 'driver_name','vehicle_reg_no','driver_number','mg_id')->whereIn('id', $driverIdArray)->get()->keyBy('id')->toArray();
               
                $favoriteLocationDetailsArray = FavoriteLocation::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
               
                $bookingStatusDetailsArray = BookingStatus::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
               
                $vehicleCategoryArray = VehicleCategory::select('id', 'vehicle_name')->whereIn('id', $vehicleIdArray)->get()->keyBy('id')->toArray();
                
                $bookingEstimateDetailsArray = BookingCustomerDetails::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
                
                $customerBalance = CustomerLedger::where('customer_id', $customerId)->orderBy('id', 'desc')->first();

                $mainResultArray = array();
                $dropPointsArray = array();
                $dropPointsDetails = array();

                $getCode = BookingDiscountCode::where('customer_id',$customerId)->get();
                $couponCodeIdsArray = array();
                $discountDataArray = array();
                if(count($getCode) > 0)
                {
                    foreach ($getCode as $key => $value) 
                    {
                        array_push($couponCodeIdsArray, $value->discount_coupon_id);    
                    }
                    $discountData = DiscountCouponCode::whereIn('id',$couponCodeIdsArray)->get()->keyBy('id')->toArray();
                    
                    $discountDataArray = array();
                    foreach ($getCode as $key => $value) 
                    {
                        if(array_key_exists($value->discount_coupon_id, $discountData))
                        {
                            $discountDataArray[$value->booking_id]  =  $discountData[$value->discount_coupon_id];
                        }
                        
                    }
                }
                $billingType = BillingType::get()->keyBy('id')->toArray();

                foreach ($bookingDetails as $key => $value) 
                {
                    $result = array();
                    $result['is_edit'] = true; 
                    $result['is_cancel'] =  true;
                    $bookingStatus = BookingStatus::where('booking_id',$value->id)->first();
                    if($bookingStatus != '')
                    { 
                        if($value->payment_option == 'pre' && $bookingStatus->start_time != '')
                        {
                            $result['is_edit'] = false; 
                        }
                        
                        if($value->payment_option == 'post'  && $bookingStatus->billing_time == '' )
                        {
                            $result['is_edit'] =  true;
                        }

                        if($value->payment_option == 'pre' && $bookingStatus->loading_time != '')
                        {
                            $result['is_cancel'] = false; 
                        }
                        
                        if($value->payment_option == 'post'  && $bookingStatus->start_time != '' )
                        {
                            $result['is_cancel'] =  false;
                        }
                    }
                    $result['trip_charge']          = 0;      
                    $result['trip_amount']          = 0;      
                    $result['lower_trip_charge']    = 0;      
                    $result['trip_distance']        = 0;      
                    $result['lower_trip_distance']  = 0; 
                    $result['total_charge']         = 0;
                    $result['loading_charge']       = 0;      
                    $result['unloading_charge']     = 0;   
                    $result['pod_charge']           = 0;    
                    $result['drop_point_charge']    = 0;      
                    $result['discount_amount']      = 0;  
                    $result['surge_amount']         = 0; 
                    $result['surge_percentage']     = 0;  
                    $result['estimated_lower_bill'] = 0;   
                    $result['estimated_upper_bill'] = 0;
                    $result['minimum_time']         = 0;
                    $result['minimum_distance']     = 0;
                    $result['minimum_bill']         = 0;  
                    $result['payment_mode']         = 0;  
                    $result['trip_charge']          = 0;      
                    $result['trip_distance']        = 0;      
                    $result['payment_recevied']     = 0;      
                    $result['mg_balance']           = 0;      
                    $result['url']                  = "";  
                    $result['amount_to_be_paid']    = 0;
                    $result['tip']                  = 0;
                    $result['driver_lat']           = '0.0';
                    $result['driver_lng']           = '0.0';
                    $result['bill']                 = 0;
                    if($value->driver_id != 0 && $value->driver_id != '-1' && $value->current_status != 'completed')
                    {
                        $getDetails = DriverRegular::where('driver_id',$value->driver_id)->orderBy('created_at','DESC')->first();
                        if($getDetails != '')
                        {
                            $result['driver_lat'] = $getDetails->lat; 
                            $result['driver_lng'] = $getDetails->lng;
                        }
                    }
                    if(array_key_exists($value->id, $discountDataArray))
                    {
                        $result['applied_coupon_code'] = $discountDataArray[$value->id]['discount_code'];
                    }
                    else
                    {
                        $result['applied_coupon_code'] = '';
                    }

                    //getting booking status
                    if(isset($bookingStatusDetailsArray[$value->id]['booking_time']))
                    {
                        if((!empty($bookingStatusDetailsArray[$value->id]['booking_time']) || !empty($bookingStatusDetailsArray[$value->id]['to_customer_time'])  || !empty($bookingStatusDetailsArray[$value->id]['loading_time']) || !empty($bookingStatusDetailsArray[$value->id]['stop_time']) || !empty($bookingStatusDetailsArray[$value->id]['billing_time']) ) &&

                         (empty($bookingStatusDetailsArray[$value->id]['complete']) && empty($bookingStatusDetailsArray[$value->id]['cancel_time']) && $value->driver_id != '-1' ) 

                         )
                        {   
                            $result['trip_id']  = $value->id;
                            //getting vehicle infromation
                            if(isset($vehicleCategoryArray[$value->vehicle_id]))
                            {
                                $result['vehicle']         = $vehicleCategoryArray[$value->vehicle_id]['vehicle_name'];
                            }
                            else
                            {
                                $result['vehicle']         = "";
                            }
                            
                            //getting driver infromation
                            if(isset($driverDetailsArray[$value->driver_id]))
                            {
                                $result['driver']             = $driverDetailsArray[$value->driver_id]['driver_name'];
                                $result['driver_number']      = $driverDetailsArray[$value->driver_id]['driver_number'];
                                $result['driver_vehicle_no']  = $driverDetailsArray[$value->driver_id]['vehicle_reg_no'];
                            }
                            else
                            {
                                $result['driver']             = "";
                                $result['driver_number']      = "";
                                $result['driver_vehicle_no']  = "";
                            }

                            if(isset($favoriteLocationDetailsArray[$value->id]))
                            {
                                if($favoriteLocationDetailsArray[$value->id] != "")
                                {
                                    $result['pick_up'] = $favoriteLocationDetailsArray[$value->id]['pickup_landmark'];
                                    $result['drop']    = $favoriteLocationDetailsArray[$value->id]['drop_landmark'];
                                    $result['pickup_lat'] = $favoriteLocationDetailsArray[$value->id]['pickup_lat'];
                                    $result['pickup_lng'] = $favoriteLocationDetailsArray[$value->id]['pickup_lng'];
                                    $result['drop_lat']    = $favoriteLocationDetailsArray[$value->id]['drop_lat'];
                                    $result['drop_lng']    = $favoriteLocationDetailsArray[$value->id]['drop_lng'];
                                       
                                }
                                else
                                {
                                    $result['pick_up'] = "";
                                    $result['drop']    = "";
                                    $result['pickup_lat'] = "";
                                    $result['pickup_lng'] = "";
                                    $result['drop_lat']    = "";
                                    $result['drop_lng']    = "";
                                }
                            }
                            $multipleDropPoints = CustomerDropPoints::where('booking_id', $value->id)->get();
                            if ($multipleDropPoints != "") 
                            {
                                $result['drop_points']  = $multipleDropPoints;   
                            }
                            else
                            {
                                $result['drop_points']  = "";
                            }
                            
                            //getting driverIdentity infromation
                            if(isset($driverDetailsArray[$value->driver_id]))
                            {
                                $result['mg_code']          = $driverDetailsArray[$value->driver_id]['mg_id'];
                            }
                            else
                            {
                                $result['mg_code']          = "";
                            }
        
                            if ( !empty($bookingStatusDetailsArray[$value->id]['booking_time'])) 
                            {  
                                if(isset($bookingEstimateDetailsArray[$value->id]))
                                {  
                                    
                                    $result['booking_type']         = $billingType[$value->customer_pricing_id]['type'];
                                    $result['trip_charge']          = $bookingEstimateDetailsArray[$value->id]['trip_charge'];
                                    $result['lower_trip_charge']    = $bookingEstimateDetailsArray[$value->id]['lower_trip_charge'];
                                    $result['discount_amount']      = $bookingEstimateDetailsArray[$value->id]['estimate_discount_amount'];
                                    $result['tip']                  = $bookingEstimateDetailsArray[$value->id]['tip_charge'];

                                    $bill                           = ( $bookingEstimateDetailsArray[$value->id]['trip_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['loading_charge'] +
                                                                        $bookingEstimateDetailsArray[$value->id]['unloading_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['drop_points_charge'] +
                                                                        $bookingEstimateDetailsArray[$value->id]['estimate_surge_charge'] +
                                                                        $bookingEstimateDetailsArray[$value->id]['pod_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['tip_charge'] ) - 
                                                                        $bookingEstimateDetailsArray[$value->id]['estimate_discount_amount'];

                                    $result['bill']          =  $bill;
                                    $result['total_charge']         =  ( $bookingEstimateDetailsArray[$value->id]['trip_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['loading_charge'] +
                                                                        $bookingEstimateDetailsArray[$value->id]['unloading_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['drop_points_charge'] +
                                                                        $bookingEstimateDetailsArray[$value->id]['pod_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['tip_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['estimate_surge_charge'] );


                                    $result['trip_distance']        =  number_format($value->upper_trip_distance, 1, '.', '');
                                    $result['lower_trip_distance']  =  number_format($value->lower_trip_distance, 1, '.', '');

                                    $result['loading_charge']       = $bookingEstimateDetailsArray[$value->id]['loading_charge'];
                                    $result['unloading_charge']     = $bookingEstimateDetailsArray[$value->id]['unloading_charge'];
                                    $result['pod_charge']           = $bookingEstimateDetailsArray[$value->id]['pod_charge'];
                                    $result['drop_point_charge']    = $bookingEstimateDetailsArray[$value->id]['drop_points_charge'];
                                    $result['surge_amount']         = $bookingEstimateDetailsArray[$value->id]['estimate_surge_charge'];
                                    $result['surge_percentage']     = $bookingEstimateDetailsArray[$value->id]['surge_percentage'];

                                    $result['estimated_lower_bill'] = ( $bookingEstimateDetailsArray[$value->id]['lower_trip_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['loading_charge'] +
                                                                        $bookingEstimateDetailsArray[$value->id]['unloading_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['estimate_surge_charge'] + 
                                                                        $bookingEstimateDetailsArray[$value->id]['drop_points_charge']) - 
                                                                        $result['discount_amount'];
                                    $result['estimated_upper_bill'] = $bill;
                                    $result['minimum_time']  =  $value->approximately_hours;
                                    $result['minimum_distance']  =  $value->upper_trip_distance;
                                    $result['minimum_bill']   = $bill;
                                    $result['payment_mode']   = $value->payment_option;
                                    
                                }
                            }
                            else
                            {
                                if(isset($bookingFinalDetailArray[$value->id]))
                                {
                                    $result['trip_charge']      = $bookingFinalDetailArray[$value->id]['trip_charge'];
                                    $result['trip_distance']    = $bookingFinalDetailArray[$value->id]['trip_distance'];
                                    $result['payment_recevied'] = $bookingFinalDetailArray[$value->id]['payment_recevied'];
                                    $result['mg_balance']       = $bookingFinalDetailArray[$value->id]['final_balance'];
                                    $result['url']              = $bookingFinalDetailArray[$value->id]['pod_image_url'];
                                }
                            }

                            if(isset($bookingEstimateDetailsArray[$value->id]))
                            {
                                if ($bookingEstimateDetailsArray[$value->id]['reference_text'] != NULL || 
                                    $bookingEstimateDetailsArray[$value->id]['reference_text'] != "") 
                                {
                                    $result['customer_notes'] = $bookingEstimateDetailsArray[$value->id]['reference_text'];
                                }
                                else
                                {
                                    $result['customer_notes'] = "";
                                }
                            }

                            if ($customerBalance != '') 
                            {
                                $result['final_balance']  = $customerBalance['final_balance'];
                            }
                            else
                            {
                                $result['final_balance']  = 0;
                            }

                            $creditLimit = 0;
                            if(!is_null($customerId))
                            {
                                $creditLimit = $this->customerCredit($customerId);
                            }
                            
                            $currentBalance = $creditLimit + $customerBalance['final_balance'];
                            if ($currentBalance <= 0) 
                            {
                                $result['amount_to_be_paid'] = $result['bill'] - $currentBalance;
                            }
                            else if ($result['bill'] > $currentBalance) 
                            {
                                $result['amount_to_be_paid'] = $result['bill'] - $currentBalance;
                            }
                            else
                            {
                                $result['amount_to_be_paid'] = 0;
                            }

                            $result['amount_to_be_paid'] = round(ceil($result['amount_to_be_paid'] / 10) * 10);

                            //getting trip infromtation
                            $result['date']    = date("d-m-Y H:i:s", strtotime($value['requirement_time']));

                            if (!empty($bookingStatusDetailsArray[$value->id]['booking_time'])) 
                            {  
                                $result['status']  = "Pending";
                            }
    
                            if (!empty($bookingStatusDetailsArray[$value->id]['to_customer_time'])) 
                            {  
                                $result['status']  = "On the way";
                            }
    
                            if (!empty($bookingStatusDetailsArray[$value->id]['loading_time'] )) 
                            {  
                                $result['status']  = "Loading";
                            }
                            if (!empty($bookingStatusDetailsArray[$value->id]['start_time'])) 
                            {  
                                $result['status']  = "Reaching destination";
                            }
    
                            if (!empty($bookingStatusDetailsArray[$value->id]['stop_time'] )) 
                            {  
                                $result['status']  = "Unloading";
                            }
    
                            array_push($mainResultArray, $result); 
                        }                   
                    }
                }
                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = $mainResultArray;
                return $response;
            }
            else 
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Mobile no is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for get all running booking deatils of customer id
    # Request : Customer id
    # Response : Success messages with data 
    # Autor : Vinod Kumar
    public function getCustomerSingleBooking($data)
    {
        if(isset($data['booking_id']))
        {
            $bookingId         = $data['booking_id'];
            if($bookingId != "")
            {     
                
                $bookingDetails = Booking::where('id', $bookingId)->first();
                $driverId = 0;
                $driverDetailsArray = array();
                if(isset($bookingDetails->driver_id))
                {
                    $driverId = $bookingDetails->driver_id;
                    $driverDetailsArray = Driver::select('id', 'driver_name','vehicle_reg_no','driver_number','mg_id')->where('id', $driverId)->first();
                }
                
                $vehicleId = $bookingDetails->vehicle_id;
                $customerId = $bookingDetails->customer_id;
                
                
                
                $favoriteLocationDetailsArray = FavoriteLocation::where('booking_id', $bookingId)->first();
               
                $bookingStatusDetailsArray = BookingStatus::where('booking_id', $bookingId)->first();
               
                $vehicleCategoryArray = VehicleCategory::select('id', 'vehicle_name')->where('id', $vehicleId)->first();
                
                $bookingEstimateDetailsArray = BookingCustomerDetails::where('booking_id', $bookingId)->first();
                
                $customerBalance = CustomerLedger::where('customer_id', $customerId)->orderBy('id', 'desc')->first();

                $mainResultArray = array();
                $dropPointsArray = array();
                $dropPointsDetails = array();

                $getCode = BookingDiscountCode::where('booking_id',$bookingId)->first();
                $couponCodeIdsArray = array();
                $discountDataArray = array();
                if(count($getCode) > 0)
                {
                    $couponCodeId = $getCode->discount_coupon_id;
                    $discountDataArray = DiscountCouponCode::where('id',$couponCodeId)->first();
                }
                $billingType = BillingType::where('id',$bookingDetails->customer_pricing_id)->first();

                $value = $bookingDetails;

                $result = array();
                if(array_key_exists($value->id, $discountDataArray))
                {
                    $result['applied_coupon_code'] = $discountDataArray[$value->id]['discount_code'];
                }
                else
                {
                    $result['applied_coupon_code'] = '';
                }

                //getting booking status
                if(isset($bookingStatusDetailsArray['booking_time']))
                {
                    if((!empty($bookingStatusDetailsArray['booking_time']) || !empty($bookingStatusDetailsArray['to_customer_time'])  || !empty($bookingStatusDetailsArray['loading_time']) || !empty($bookingStatusDetailsArray['stop_time']) || !empty($bookingStatusDetailsArray['billing_time']) ) &&

                     (empty($bookingStatusDetailsArray['complete']) && empty($bookingStatusDetailsArray['cancel_time']) && $value->driver_id != '-1' ) 

                     )
                    {   
                        
                        $result['trip_id']  = $value->id;
                        //getting vehicle infromation
                        if(isset($vehicleCategoryArray))
                        {
                            $result['vehicle']         = $vehicleCategoryArray['vehicle_name'];
                        }
                        else
                        {
                            $result['vehicle']         = "";
                        }
                        
                        //getting driver infromation
                        if(isset($driverDetailsArray))
                        {
                            $result['driver']             = $driverDetailsArray['driver_name'];
                            $result['driver_number']      = $driverDetailsArray['driver_number'];
                            $result['driver_vehicle_no']  = $driverDetailsArray['vehicle_reg_no'];
                            $result['mg_code']            = $driverDetailsArray['mg_id'];
                        }
                        else
                        {
                            $result['driver']             = "";
                            $result['driver_number']      = "";
                            $result['driver_vehicle_no']  = "";
                            $result['mg_code']            = "";
                        }

                        if(isset($favoriteLocationDetailsArray))
                        {
                            if($favoriteLocationDetailsArray != "")
                            {
                                $result['pick_up'] = $favoriteLocationDetailsArray['pickup_landmark'];
                                $result['drop']    = $favoriteLocationDetailsArray['drop_landmark'];
                                $result['pickup_lat'] = $favoriteLocationDetailsArray['pickup_lat'];
                                $result['pickup_lng'] = $favoriteLocationDetailsArray['pickup_lng'];
                                $result['drop_lat']    = $favoriteLocationDetailsArray['drop_lat'];
                                $result['drop_lng']    = $favoriteLocationDetailsArray['drop_lng'];
                                   
                            }
                            else
                            {
                                $result['pick_up'] = "";
                                $result['drop']    = "";
                                $result['pickup_lat'] = "";
                                $result['pickup_lng'] = "";
                                $result['drop_lat']    = "";
                                $result['drop_lng']    = "";
                            }
                            
                        }
                        $multipleDropPoints = CustomerDropPoints::where('booking_id', $value->id)->get();
                        if ($multipleDropPoints != "") 
                        {
                            $result['drop_points']  = $multipleDropPoints;   
                        }
                        else
                        {
                            $result['drop_points']  = "";
                        }
                        
                        if ( !empty($bookingStatusDetailsArray['booking_time'])) 
                        {  
                            if(isset($bookingEstimateDetailsArray))
                            {  
                                
                                $result['booking_type']         = $billingType['type'];
                                $result['trip_charge']          = $bookingEstimateDetailsArray['trip_charge'];
                                $result['lower_trip_charge']    = $bookingEstimateDetailsArray['lower_trip_charge'];
                                $result['discount_amount']      = $bookingEstimateDetailsArray['estimate_discount_amount'];

                                $bill                           = ( $bookingEstimateDetailsArray['trip_charge'] + 
                                                                    $bookingEstimateDetailsArray['loading_charge'] +
                                                                    $bookingEstimateDetailsArray['unloading_charge'] + 
                                                                    $bookingEstimateDetailsArray['drop_points_charge'] +
                                                                    $bookingEstimateDetailsArray['estimate_surge_charge'] +
                                                                    $bookingEstimateDetailsArray['tip_charge'] +
                                                                    $bookingEstimateDetailsArray['waiting_time_charge'] ) - 
                                                                    $bookingEstimateDetailsArray['estimate_discount_amount'];

                                $result['bill']          =  $bill;
                                $result['total_charge']         =  ( $bookingEstimateDetailsArray['trip_charge'] + 
                                                                    $bookingEstimateDetailsArray['loading_charge'] +
                                                                    $bookingEstimateDetailsArray['unloading_charge'] + 
                                                                    $bookingEstimateDetailsArray['drop_points_charge'] +
                                                                    $bookingEstimateDetailsArray['pod_charge'] + 
                                                                    $bookingEstimateDetailsArray['tip_charge'] +
                                                                    $bookingEstimateDetailsArray['waiting_time_charge'] +
                                                                    $bookingEstimateDetailsArray['estimate_surge_charge'] );


                                $result['trip_distance']        =  number_format($value->upper_trip_distance, 1, '.', '');
                                $result['lower_trip_distance']  =  number_format($value->lower_trip_distance, 1, '.', '');

                                $result['loading_charge']       = $bookingEstimateDetailsArray['loading_charge'];
                                $result['unloading_charge']     = $bookingEstimateDetailsArray['unloading_charge'];
                                $result['pod_charge']           = $bookingEstimateDetailsArray['pod_charge'];
                                $result['drop_point_charge']    = $bookingEstimateDetailsArray['drop_points_charge'];
                                $result['surge_amount']         = $bookingEstimateDetailsArray['estimate_surge_charge'];
                                $result['surge_percentage']     = $bookingEstimateDetailsArray['surge_percentage'];

                                $result['estimated_lower_bill'] = ( $bookingEstimateDetailsArray['lower_trip_charge'] + 
                                                                    $bookingEstimateDetailsArray['loading_charge'] +
                                                                    $bookingEstimateDetailsArray['unloading_charge'] + 
                                                                    $bookingEstimateDetailsArray['estimate_surge_charge'] + 
                                                                    $bookingEstimateDetailsArray['drop_points_charge']) - 
                                                                    $result['discount_amount'];
                                $result['estimated_upper_bill'] = $bill;
                                $result['minimum_time']  =  $value->approximately_hours;
                                $result['minimum_distance']  =  $value->upper_trip_distance;
                                $result['minimum_bill']   = $bill;
                                $result['payment_mode']   = $value->payment_option;
                                $result['tip']   = $bookingEstimateDetailsArray['tip_charge'];
                                
                            }
                            else
                            {
                                $result['trip_charge']          = 0;      
                                $result['trip_amount']          = 0;      
                                $result['lower_trip_charge']    = 0;      
                                $result['trip_distance']        = 0;      
                                $result['lower_trip_distance']  = 0; 
                                $result['total_charge']         = 0;
                                $result['loading_charge']       = 0;      
                                $result['unloading_charge']     = 0;   
                                $result['pod_charge']           = 0;    
                                $result['drop_point_charge']    = 0;      
                                $result['discount_amount']      = 0;  
                                $result['surge_amount']         = 0; 
                                $result['surge_percentage']     = 0;  
                                $result['estimated_lower_bill'] = 0;   
                                $result['estimated_upper_bill'] = 0;
                                $result['minimum_time']         = 0;
                                $result['minimum_distance']     = 0;
                                $result['minimum_bill']         = 0;  
                                $result['payment_mode']         = 0;   
                                $result['tip']                  = 0;     
                            }
                        }
                        else
                        {
                            if(isset($bookingFinalDetailArray[$value->id]))
                            {
                                $result['trip_charge']      = $bookingFinalDetailArray['trip_charge'];
                                $result['trip_distance']    = $bookingFinalDetailArray['trip_distance'];
                                $result['payment_recevied'] = $bookingFinalDetailArray['payment_recevied'];
                                $result['mg_balance']       = $bookingFinalDetailArray['final_balance'];
                                $baseUrl = url('/');
                                $result['url']              = $baseUrl.$bookingFinalDetailArray['pod_image_url'];
                            }
                            else
                            {
                                $result['trip_charge']      = 0;      
                                $result['trip_distance']    = 0;      
                                $result['payment_recevied'] = 0;      
                                $result['mg_balance']       = 0;      
                                $result['url']              = "";      
                            }
                        }

                        if(isset($bookingEstimateDetailsArray))
                        {
                            if ($bookingEstimateDetailsArray['reference_text'] != NULL || 
                                $bookingEstimateDetailsArray['reference_text'] != "") 
                            {
                                $result['customer_notes'] = $bookingEstimateDetailsArray['reference_text'];
                            }
                            else
                            {
                                $result['customer_notes'] = "";
                            }
                        }

                        if ($customerBalance != '') 
                        {
                            $result['final_balance']  = $customerBalance['final_balance'];
                        }
                        else
                        {
                            $result['final_balance']  = 0;
                        }

                        $creditLimit = 0;
                        if(!is_null($customerId))
                        {
                            $creditLimit = $this->customerCredit($customerId);
                        }
                        
                        $currentBalance = $creditLimit + $customerBalance['final_balance'];
                        if ($currentBalance <= 0) 
                        {
                            $result['amount_to_be_paid'] = $result['bill'] - $currentBalance;
                        }
                        else if ($result['bill'] > $currentBalance) 
                        {
                            $result['amount_to_be_paid'] = $result['bill'] - $currentBalance;
                        }
                        else
                        {
                            $result['amount_to_be_paid'] = 0;
                        }

                        $result['amount_to_be_paid'] = round(ceil($result['amount_to_be_paid'] / 10) * 10);
                        //getting trip infromtation
                        $result['date']    = date("d-m-Y H:i:s", strtotime($value['requirement_time']));

                        if (!empty($bookingStatusDetailsArray['booking_time'])) 
                        {  
                            $result['status']  = "Pending";
                        }

                        if (!empty($bookingStatusDetailsArray['to_customer_time'])) 
                        {  
                            $result['status']  = "On the way";
                        }

                        if (!empty($bookingStatusDetailsArray['loading_time'] )) 
                        {  
                            $result['status']  = "Loading";
                        }
                        if (!empty($bookingStatusDetailsArray['start_time'])) 
                        {  
                            $result['status']  = "Reaching destination";
                        }

                        if (!empty($bookingStatusDetailsArray['stop_time'] )) 
                        {  
                            $result['status']  = "Unloading";
                        }
                    }                   
                }
                return $result;
            }
            else 
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Mobile no is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for cancel the booking before allotment
    # Request : Booking id
    # Response : Success messages with data 
    # Autor : Vinod Kumar
    public function getCustomerWalletAPI(Request $request)
    {
        $data         = $request->all();

        $startDate    = NULL;
        $endDate      = NULL;
        $startStrDate = NULL;
        $endStrDate   = NULL;
        $customerId   = NULL; 
        if(isset($data['customer_id']))
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        $query = CustomerLedger::where('customer_id', $customerId);
        if(isset($data['start_date']))
        {
            $startStrDate = strtotime($data['start_date']);
            $startDate    = date('Y-m-d 00:00:00', $startStrDate);
            $query = $query->where('created_at', '>', $startDate);
        }
        
        if(isset($data['end_date']))
        {
            $endStrDate     = strtotime($data['end_date']);
            $endDate        = date('Y-m-d 23:59:59', $endStrDate);
            $query = $query->where('created_at', '<', $endDate);
            
        }
        $query->orderBy('id', 'desc');
        if(!isset($data['end_date']) && !isset($data['end_date']))
        {
            $query->take(10);
        }
        
        $customerDetails = $query->get();
        
        foreach ($customerDetails as $key => $value) 
        {
            
            if($value->booking_id == 0)
            {
                $value->booking_id = "";   
            }
            
            if($value->remark == '')
            {
                $value->remark = "Trip";   
            }
            else if($value->remark == "Cash Receive")
            {
                $value->remark = "Payment";
            }
            else if($value->remark == "Amount received online")
            {
                $value->remark = "Payment";
                $value->nots = "Amount received online";
            }
            else if($value->remark  == "Bill Amount" || $value->remark  == "Amount Recieved" )
            {
                $value->remark = "Adjustment";
            }
            else if($value->remark == "Toll Charges")
            {
                $value->remark = "Toll";
            }
            else if($value->remark == "Chaalan Amount")
            {
                $value->remark = "Chaalan";
            }
            else if($value->remark == "Overload Amount")
            {
                $value->remark = "Overload";
            }
            else if($value->remark == "Cancellation charge apply")
            {
                $value->remark = "Cancellation";
            }
            else if($value->remark == "Booking Cashback")
            {
                $value->remark = "Booking Cashback";
            }
        }
        //Toll Charges, Bill Amount, invoice payment, Cash Receive, Discount, Cancellation charge apply, Amount Recieved

        if(count($customerDetails) > 0)
        {
            $response['success'] = true;
            $response['message'] = "Record found";
            $response['data']    = $customerDetails;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = array();
            return $response;
        }
        
    }
    # Function : This function used for cancel the booking before allotment
    # Request : Booking id
    # Response : Success messages with data 
    # Autor : Vinod Kumar

    public function sendPodOrInvoiceThroughEmail(Request $request)
    {
        $data   = $request->all();
        $result = array();
        if(isset($data['customer_id']))
        {
            $customerId         = $data['customer_id'];
            $customerDetials    = Customer::where('id', $customerId)->first();
            
            if($customerDetials != "")
            {
                if ($customerDetials['cust_email'] == "NA") 
                {
                    if (isset($data['email'])) 
                    {
                        $email = $data['email'];
                        if($email == NULL || $email == "")
                        {
                            $response['success'] = false;
                            $response['message'] = "Looks like you haven't given us your email address. Please update your email address in the Profile tab.";
                            $response['data']    = (object) array();
                            return $response;       
                        }
                    }
                    else
                    {
                        $response['success'] = false;
                        $response['message'] = "Email id is required";
                        $response['data']    = (object) array();
                        return $response;
                    }
                }
                else
                {
                    $email = $customerDetials['cust_email'];
                    if($email == NULL || $email == "")
                    {
                        $response['success'] = false;
                        $response['message'] = "Looks like you haven't given us your email address. Please update your email address in the Profile tab.";
                        $response['data']    = (object) array();
                        return $response;       
                    }
                }

                if (isset($data['booking_id'])) 
                {
                    $bookingId      = $data['booking_id'];
                   
                    $bookingDetails = Booking::where('id', $bookingId)
                                               ->where('driver_id','!=','-1')
                                               ->first();
                    if (count($bookingDetails) > 0) 
                    {
                        if (isset($data['invoice'])) 
                        {
                            $invoice = new SpecialController;
                            $result = $invoice->sendMail($bookingId,'');
                            if(!empty($result))
                            {
                                $array['success']            = array();
                                $array['success']['message'] = "Mail sent.";
                                return $array;
                            }
                            else
                            {
                                $response['success'] = false;
                                $response['message'] = "Email id not registered.";
                                $response['data']    = (object) array();
                                return $response;
                            }
                        }//End invoice condition

                        // if recieved pod value
                        else if(isset($data['pod']))
                        {
                            $driver = Driver::find($bookingDetails->driver_id);    
                            $getSettings = array();
                            $subject='POD';
                            $customerId = $customerDetials['id'];

                            if($customerId != '')
                            { 
                                $getSettings = CustomerSetting::where('customer_id',$customerId)->first();
                                if($getSettings != "")
                                {
                                    if($getSettings->trip_id != '0')
                                    {
                                        $bookingId = $bookingId;
                                        $subject   = $subject.'-'.$bookingId;
                                    }
                                    
                                    if($getSettings->reference_text != '0')
                                    {
                                        $bookingEsitmate = BookingCustomerDetails::where('booking_id', $bookingId)->first();
                                        if(isset($bookingEsitmate->reference_text) && $bookingEsitmate->reference_text)
                                        {
                                            $note    = $bookingEsitmate['reference_text'];
                                            $subject = $subject.'-'.$note;
                                        } 

                                    } 
                                    
                                    if($getSettings->vehicle_reg_num !='0')
                                    {
                                        if(isset($driver->vehicle_reg_no) && ($driver->vehicle_reg_no != ''))
                                        {
                                            $registration_no = $driver->vehicle_reg_no;
                                            $subject         = $subject.'-'.$registration_no;    
                                        }
                                    }
                                    
                                    if($getSettings->schedule_date != '0')
                                    {
                                        if(isset($bookingDetails->requirement_time))
                                        { 
                                            $date    = date('d/m/Y',strtotime($bookingDetails->requirement_time)); 
                                            $subject = $subject.'-'.$date;
                                        }
                                    }
                                }
                            } 

                            $pod = $data['pod'];
                            if ($pod != '') 
                            {
                                $baseUrl = url('/');
                                $string = $baseUrl.$bookingDetails->pod_image_url;
                                $image  = 'POD Image';
                                $logo   = $baseUrl.'/images/logo.png'; 

                                $data = array('image'  => $image, 'imageURL' => $string,'logo' => $logo);
                                Mail::send('email.pod',$data, function($message) use($email, $string,$subject)
                                {                                  
                                    $message->to($email)->subject($subject);
                                    $message->from('support@maalgaadi.net', 'POD Image');
                                    $message->attach($string);                                    
                                });

                                $response['success'] = true;
                                $response['message'] = "Mail sent.";
                                $response['data']    = (object) array();
                                return $response;
                            }
                        }
                        else
                        {
                            $response['success'] = false;
                            $response['message'] = "Invoice or POD parameter is required.";
                            $response['data']    = (object) array();
                            return $response;
                        }
                    }//End POD condition
                    else
                    {
                        $response['success'] = false;
                        $response['message'] = "No record found..";
                        $response['data']    = (object) array();
                        return $response;
                    }
                }
                else 
                {
                    $response['success'] = false;
                    $response['message'] = "Booking id is required.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            else 
            {
                $response['success'] = false;
                $response['message'] = "Mobile number is not registered in the system.";
                $response['data']    = (object) array();
                return $response;
            } 
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Mobile number is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }//end sendPODorInvoiceemail function

    # Function : This function used for cancel the booking before allotment
    # Request : Booking id
    # Response : Success messages with data 
    # Autor : Vinod Kumar
    public function cancelCustomerBooking(Request $request)
    {
        $data  = $request->all();
        $array = array();
        $isCancel = 'yes';
        if(isset($data['booking_id']))
        {
            $bookingFinalDetials = BookingStatus::where('booking_id', $data['booking_id'])->first();
            $booking = Booking::find($data['booking_id']);
            $getSettings = MaalgaadiSettings::where('city_id',$booking->city_id)->first();            
            if($booking->payment_option == 'pre' && $bookingFinalDetials->loading_time != '')
            {
                $isCancel = 'no'; 
            }
            
            if($booking->payment_option == 'post'  && $bookingFinalDetials->start_time != '' )
            {
                $isCancel = 'no'; 
            }

            if($isCancel == "no")
            {
                $response['success'] = false;
                $response['message'] = "To cancel this trip, please contact MaalGaadi's at ".$getSettings->customer_care_contact.".";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $checkCancel = CancelBooking::where('booking_id', $data['booking_id'])->first();

                if($checkCancel == '')
                {
                    $bookingstatus = BookingStatus::where('booking_id',$data['booking_id'])->orderBy('id','desc')->first();
                    $deletedRows   = EmployeeAllotment::where('booking_id',$data['booking_id'])->delete();
                    $deletedRows   = DriverIncompleteTrip::where('booking_id',$data['booking_id'])->delete();

                    if(empty($bookingstatus->complete))
                    {
                        $bookingId   = $data['booking_id'];
                        $reason = 'Vehicle not available on time';
                        $issues_type = 'scrapOff';
                        $action = 'all';
                        if(isset($data['reason']) && $data['reason'])
                        {
                            $reason      = $data['reason'];
                            $cancelReason  = CancellationReason::where('id', $reason)->first();
                            $reason = $cancelReason['reason'];
                        }
                        if(isset($data['issues_type']))
                        {
                            $issues_type      = $data['issues_type'];
                        }
                        if(isset($data['action']))
                        {
                            $action      = $data['action'];
                        }
                        $booking     = Booking::find($bookingId);
                        $driverId    = $booking->driver_id;
                        $scheduleTime = (strtotime(date('Y-m-d H:i:s')) - strtotime($booking->requirement_time))/60;

                        if($booking->driver_id != 0 && $booking->driver_id != -1)
                        {
                            $drivercode = Driver::where('id','=',$booking->driver_id)->first();
                            $booking->mg_code = $drivercode->mg_id;
                            $booking->current_status = 'cancel';
                        }
                        
                        $cancelBooking = new CancelBooking;
                        $cancelBooking->employee_id = "44";
                        $cancelBooking->booking_id  = $bookingId;
                        if($scheduleTime > 5 || $driverId != '')
                        {
                            $cancelBooking->reason      = $reason;
                            $cancelBooking->issues_type = $issues_type;
                            $cancelBooking->action      = $action;
                        }
                        else
                        {
                            $cancelBooking->reason      = 'OD vehicle not available';
                            $cancelBooking->issues_type = 'AvailabilityOD';
                            $cancelBooking->action      = 'Scrapped Off';
                        }
                        $cancelBooking->created_at  = date("Y-m-d H:i:s");
                        $cancelBooking->updated_at  = date("Y-m-d H:i:s");
                        $cancelBooking->save();

                        $canceldate                   = date("Y-m-d H:i:s");
                        $bookingstatus->cancel_time   = $canceldate;
                        $bookingstatus->save();

                        $booking->driver_id           = '-1';       
                        $booking->save();

                        $allotedBooking = AllotedBooking::where('booking_id', $bookingId)->first();                                               
                        if(count($allotedBooking) > 0)
                        {
                            $dashboardNotification = DashboardNotification::where('driver_id', $allotedBooking->driver_id)->where('booking_id', $bookingId)->first();
                            if($dashboardNotification == '')
                            {
                                $driverDetials  = Driver::select('id', 'tokenid')->where('id', $drivercode->id)->first();
                                if(isset($driverDetials->tokenid))
                                {
                                    $locationDetails = FavoriteLocation::where('booking_id', $bookingId)->first();

                                    $cancel = array('booking_id' => $bookingId,
                                                    'message'=> "यह बुकिंग ग्राहक द्वारा निरस्त कर दी गई है."
                                                    );
                                    $canceldata = array('cancel' => $cancel);
                                   $message = PushNotification::Message(array('cancel_booking' => $canceldata,'message'=> "यह बुकिंग ग्राहक द्वारा निरस्त कर दी गई है."));
                                    $deviceToken    = $driverDetials->tokenid;
                                    $notifyDriver   = NULL;
                                    $notifyDriver = PushNotification::app('appNameAndroid')->to($deviceToken)->send($message);
                                     
                                }// if isset 
                            }//if dashaborad
                            
                        } // if assigned

                        $response['success'] = true;
                        $response['message'] = "Your booking has been cancelled.";
                        $response['data']    = (object) array();
                        return $response;
                    }// status check    
                    else
                    {  
                        $response['success'] = false;
                        $response['message'] = "Booking is completed.";
                        $response['data']    = (object) array();
                        return $response;
                    }// status check else
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Booking has already been cancelled.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Mail sent.";
            $response['data']    = (object) array();
            return $response;
        }
    }//End cancelCustomerBooking

    # Function is used for get Cancel reason
    # Request : Booking Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function getCancellationReason()
    {
        $cancellationReason          = CancellationReason::select('id', 'reason')->get();
        if(count($cancellationReason))
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $cancellationReason;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;   
        }
        
    }//End getCancellationReason

    # Function is used for Send Push notification to mobile device
    # Request : Booking Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function storeCustomerDeviceToken(Request $request)
    {
        $data = $request->all();
        if(isset($data['customer_id']) && isset($data['customer_id']))
        {
            $customerId     = $data['customer_id'];
            $token     = $data['token'];
            $check     = Customer::where('id', $customerId)->first();
            if($check != '')
            {
                if($check['device_id'] != '')
                {
                    $deviceToken = CustomerAppDownload::where('device_id', $check['device_id'])->first();
                    if($deviceToken != '')
                    {
                        $check->device_token         = $deviceToken->device_token;
                    }
                    else
                    {
                        $deviceToken = new CustomerAppDownload;
                        $deviceToken->device_id    = $check['device_id'];
                        $deviceToken->device_token = $token;
                        $deviceToken->save();
                    }
                }
                else
                {
                    $check->device_token         = $token;
                }

                $check->save();

                if($check->device_token != '')
                {
                    $response['success'] = true;
                    $response['message'] = "Token has been successfully store.";
                    $response['data']    = array('token' => $check->device_token);
                    return $response; 
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Token storage has failed.";
                    $response['data']    = (object) array();
                    return $response; 
                }
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Token storage has failed.";
                $response['data']    = (object) array();
                return $response; 
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Required parameters are missing.";
            $response['data']    = (object) array();
            return $response; 
        }

        $response['success'] = true;
        $response['message'] = "Record found.";
        $response['data']    = $data;
        return $response; 
        
    }

    # Function is used for Send Push notification to mobile device
    # Request : Booking Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function notificationToCustomer(Request $request)
    {
        $data  = $request->all();
        $array = array();
        if(isset($data['booking_id']) && $data['booking_id'] != '')
        {
            $bookingId    = $data['booking_id'];

            $bookingDetails   = Booking::where('id',$bookingId)->first();
            if($bookingDetails != '')
            {
                if ($bookingDetails->driver_id == '-1') 
                {
                    $customerDetails  = Customer::where('id', $bookingDetails->customer_id)->first();
                    if(isset($customerDetails->device_token))
                    {
                        $locationDetails = FavoriteLocation::where('booking_id', $bookingId)->first();

                        $message = array(
                                'booking_id' => $bookingId,
                                'pickup_location' => $locationDetails->pickup_location,
                                'drop_location' => $locationDetails->drop_location,
                                'type' => 'cancellation'

                                );
                        // return $message['booking_id'];
                        $deviceToken    = $customerDetails->device_token;
                        $result = NULL;
                        $result = $this->pushNotificationFCM($deviceToken, $message);
                        $response['success'] = true;
                        $response['message'] = "Notification sent.";
                        $response['data']    = $message;
                        return $response; 
                    }
                    else
                    {
                        $response['success'] = false;
                        $response['message'] = "Device token unavailable.";
                        $response['data']    = (object) array();
                        return $response; 
                    }
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Booking not cancel.";
                    $response['data']    = (object) array();
                    return $response; 
                }
                
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Invalid booking Id.";
                $response['data']    = (object) array();
                return $response; 
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Invalid booking Id.";
            $response['data']    = (object) array();
            return $response; 
        }
    }

    # Function is used for Send Push notification to mobile device
    # Request : Device Token and Message Array
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function pushNotificationFCM($deviceToken, $message)
    {
        if ($deviceToken != NULL) 
        {
            $optionBuiler = new OptionsBuilder();
            $optionBuiler->setTimeToLive(60*20);
            
            $notificationBuilder = new PayloadNotificationBuilder();
            $notificationBuilder->setBody('This Booking is cancelled' . "=" .$message['booking_id'])
                                ->setSound('default');
            
            $dataBuilder = new PayloadDataBuilder();
            $dataBuilder->addData($message);
            
            $option = $optionBuiler->build();
            $notification = $notificationBuilder->build();
            $data = $dataBuilder->build();
            
            $downstreamResponse = FCM::sendTo($deviceToken, $option, NULL, $data);
            
            $temp = $downstreamResponse->numberSuccess();
            $downstreamResponse->numberFailure();
            $downstreamResponse->numberModification();
            
            $downstreamResponse->tokensToDelete(); 
            
            $downstreamResponse->tokensToModify(); 
            
            $downstreamResponse->tokensToRetry();
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Device token unavailable.";
            $response['data']    = (object) array();
            return $response; 
        }
    }

    # Function is used for get Customer Details
    # Request : customer Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function getCustomerDetials(Request $request)
    {
        $data  = $request->all();
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
            $customerId = $data['customer_id'];
            $customerDetails = Customer::where('id', $customerId)->first();
            if($customerDetails != "")
            {   
                $customerCredit = CustomerCreditLimit::where('customer_id', $customerId)->where('approved_by', '!=', '0')->first();
                if($customerCredit != "")
                {
                    $customerDetails->credit_limit = $customerCredit->credit_limit; 
                    $customerDetails->display_limit = true;
                }
                else
                {
                    $customerDetails->credit_limit = 0;
                    $customerDetails->display_limit = false;
                }
                
                $typeOfGoods = GoodsType::where('id', $customerDetails->goods_id)->first();

                if($typeOfGoods != "")
                {
                    $customerDetails->type  = $typeOfGoods->goods_name;    
                }
                else
                {
                    $customerDetails->type  = "";
                }
                
                $customerBalance = CustomerLedger::where('customer_id', $customerId)->orderBy('id', 'desc')->first();
                if ($customerBalance != "") 
                {
                    $customerDetails->final_balance = $customerBalance['final_balance'];
                }
                else
                {
                    $customerDetails->final_balance = 0;
                }

                $ratingDetailsArray = 0;
                $ratingDetails      = AverageRating::select('average_rating')->where('user_id', $customerId)->where('user_type','customer')->first();
                $rating             = 5;
                if($ratingDetails != "")
                {
                    $rating = $ratingDetails->average_rating;
                    $customerDetails->rating = $rating;
                }
                else
                {
                    $customerDetails->rating = $rating;   
                }
               
                $favouriteDriver = FavouriteDriver::where('customer_id', $customerId)->where('status','Active')->first();  
                $allowFavouriteDriver = false;
                if($favouriteDriver)
                {
                    $allowFavouriteDriver = true;
                } 
                $customerDetails->fav_driver = $allowFavouriteDriver;

                $getCity = City::find($customerDetails->city_id);
                $customerDetails->zip_code = $getCity->zip_code;
                $customerDetails->city = $getCity->city;
                $customerDetails->state = $getCity->state;

                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = $customerDetails;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "No record found..";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function is used for get type of goods
    # Request : customer Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function getTypeOfGoods(Request $request)
    {
        $data = $request->all();
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $getCustomer = Customer::find($customerId);
        if(isset($data['vehicle_id']) && $data['vehicle_id'] != '' && $data['vehicle_id'] != 0)
        {
            $getGoods = VehicleGood::where('vehicle_id',$data['vehicle_id'])->get();
            $goodsIdsArray = array();
            if($getGoods != '')
            {
                foreach ($getGoods as $key => $value) 
                {
                    if(!in_array($value->good_id, $goodsIdsArray))
                    {
                        array_push($goodsIdsArray, $value->good_id);
                    }
                }
            }
            $typeOfGoods = GoodsType::whereIn('id',$goodsIdsArray)->where('city_id',$getCustomer->city_id)->get();
        }
        else
        {
            $typeOfGoods = GoodsType::where('city_id',$getCustomer->city_id)->get();
        }
        if ($typeOfGoods != '') 
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $typeOfGoods;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found..";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function is used for reset password bt OTP
    # Request : Phone Number
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar

    public function passwordResetByOTP(Request $request)
    {
        $data = $request->all();
        
        if(isset($data['phone']))
        {
            $phone = $data['phone'];   

            $customerDetials  = Customer::where('cust_number', $phone)->first();
            if($customerDetials != "")
            {
                $otpCode = rand(11111,99999);
        
                //Your authentication key
                $authKey = "85262ARwrcvP1i7555eec59";
        
                //Sender ID,While using route4 sender id should be 6 characters long.
                $senderId = "MLGADI";
        
                //Your message to send, Add URL encoding here.
                $message = urlencode('MaalGaadi Login OTP MG: '.$otpCode);
        
                //Define route 
                $route = "4";
                //Prepare you post parameters
                $postData = array(
                    'authkey' => $authKey,
                    'mobiles' => $phone,
                    'message' => $message,
                    'sender'  => $senderId,
                    'route'   => $route
                );
        
                //API URL
                $url = "http://vtermination.com/sendhttp.php";
        
                // init the resource
                $ch = curl_init();
                curl_setopt_array($ch, array(
                    CURLOPT_URL => $url,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST => true,
                    CURLOPT_POSTFIELDS => $postData
                    //,CURLOPT_FOLLOWLOCATION => true
                ));
        
        
                //Ignore SSL certificate verification
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
        
        
                //get response
                $output = curl_exec($ch);
        
                // return $otpCode;

                //store OTP into database                   
                $customerDetials->customer_otp = $otpCode;
                $customerDetials->save();

                //Print error if any
                if(curl_errno($ch))
                {
                    $response['success'] = false;
                    $response['message'] = "OTP sending failed.";
                    $response['data']    = (object) array();
                    return $response;
                }
        
                curl_close($ch);
                
                $response['success'] = true;
                $response['message'] = "OTP sent.";
                $response['data']    = (object) array('otp' => $otpCode ,'customerTable' => $customerDetials);
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Your mobile number isn't registered with MaalGaadi. You could signup or use a registered number to login.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Mobile number is required.";
            $response['data']    = (object) array();
            return $response;
        }
       
    }

    # Function is used for Add Customer Fav Location
    # Request : lat, lng, Location And Customer Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar
    public function addCustomerFavoriteLocation(Request $request)
    {
        $data       = $request->all();
        $lat        = NULL;
        $lng        = NULL;
        $customerId = NULL;
        $address    = NULL;
        $number     = NULL;
        $landmark   = NULL;
        $array      = array();
        $response = array();
        if($this->_checkAccessToken() == false)
        {
            $response['success'] = false;
            $response['message'] = "401 unauthorized access is denied due to invalid request.";
            $response['data']    = (object) array();
            return $response;
        }

        //checking lat parameter is set or not
        if(isset($data['lat']))
        {
            $lat = $data['lat'];

            if ($lat == '') 
            {
                $lat = 0.0;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Lat is required parameter.";
            $response['data']    = (object) array();
            return $response;
        }

        //checking lng parameter is set or not
        if(isset($data['lng']))
        {
            $lng = $data['lng'];

            if ($lng == '') 
            {
                $lng = 0.0;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Lng is required parameter.";
            $response['data']    = (object) array();
            return $response;
        }

        //checking customer id parameter is set or not
        if(isset($data['customer_id']))
        {
            $customerId = $data['customer_id'];

            if ($customerId == '') 
            {
                $response['success'] = false;
                $response['message'] = "Customer Id is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        //checking address parameter is set or not
        if(isset($data['address']))
        {
            $address = $data['address'];

            if ($address == '') 
            {
                $response['success'] = false;
                $response['message'] = "Address is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Address is required.";
            $response['data']    = (object) array();
            return $response;
        }

        //checking number parameter is set or not
        if(isset($data['number']))
        {
            $number = $data['number'];

            if ($number == '') 
            {
                $response['success'] = false;
                $response['message'] = "Mobile number is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Mobile number is required.";
            $response['data']    = (object) array();
            return $response;
        }

        //checking landmark parameter is set or not
        if(isset($data['landmark']))
        {
            $landmark = $data['landmark'];

            if ($landmark == '') 
            {
                $response['success'] = false;
                $response['message'] = "Landmark is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Landmark is required";
            $response['data']    = (object) array();
            return $response;
        }

        if ($lat != '' && $lng != '' && $customerId != '' && $address != '' && $number != '' && $landmark != '') 
        {
            $favoriteLocationCustomer = FavoriteLocationCustomer::where('customer_id', $customerId)->where('address', $address)->where('number', $number)->where('landmark', $landmark)->where('lat', $lat)->where('lan', $lng)->first();
            
            if($favoriteLocationCustomer != "")
            {
                $response['success'] = true;
                $response['message'] = "Location saved as favourite.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $favoriteLocation                 = new FavoriteLocationCustomer;
                $favoriteLocation->lat            = $lat;
                $favoriteLocation->lan            = $lng;
                $favoriteLocation->customer_id    = $customerId;
                $favoriteLocation->address        = $address;
                $favoriteLocation->number         = $number;
                $favoriteLocation->landmark       = $landmark;
                $favoriteLocation->edit_by        = $lng;
                $favoriteLocation->last_update_by = "Customer";
                $favoriteLocation->created_at     = date("Y-m-d H:i:s");
                $favoriteLocation->update_at      = date("Y-m-d H:i:s");
                $favoriteLocation->save();
                //saved location
                if($favoriteLocation != "")
                {
                    $response['success'] = true;
                    $response['message'] = "Location saved as favourite.";
                    $response['data']    = (object) array();
                    return $response;
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Required parameters are missing.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Required parameters are missing.";
            $response['data']    = (object) array();
            return $response;
        }

    }

    # Function is used for Get all Customer Fav Location
    # Request : Customer Id
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 

    public function getCustomerFavoriteLocation(Request $request)
    {
        $data       = $request->all();
        $customerId = NULL;
        //checking for customer id
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        //fetching all the records related to customer
        $favoriteLocation = FavoriteLocationCustomer::where('customer_id', $customerId)->get();
        if($favoriteLocation != "")
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $favoriteLocation;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found..";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function is used for Delete Customer Fav Location
    # Request : Fav loc Id 
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 
    public function deleteCustomerFavoriteLocationByMobile(Request $request)
    {  
        $data     = $request->all();
        if(isset($data['id']) && $data['id'] != '')
        {
            $id = $data['id'];
            FavoriteLocationCustomer::where('id',$id)->delete();
            $response['success'] = true;
            $response['message'] = "Record deleted.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Favorite location id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function is used for Update Customer Fav Location
    # Request : Customer Id 
    # Response : Message With With Sucess
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 

    public function updateCustomerFavoriteLocation(Request $request)
    {  
      
        $data     = $request->all();
        $result   = array();
    
        if(isset($data['id']))
        {
            $id = $data['id'];
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Favorite location id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    
        $favoriteLocation  = FavoriteLocationCustomer::find($id);
        if($favoriteLocation == '')
        {
            $response['success'] = false;
            $response['message'] = "Favorite location id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['address']))
        {
            $favoriteLocation->address = $data['address'];
        }

        if(isset($data['number']))
        {
            $favoriteLocation->number = $data['number'];
        }

        if(isset($data['landmark']))
        {
            $favoriteLocation->landmark = $data['landmark'];
        }

        if(isset($data['lat']) && $data['lat'] != '0.0')
        {
            $favoriteLocation->lat = $data['lat'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Invalid Address.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['lng']) && $data['lng'] != '0.0')
        {
            $favoriteLocation->lan = $data['lng'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Favorite location address is invalid.";
            $response['data']    = (object) array();
            return $response;
        }


        $favoriteLocation->save();

        $response['success'] = true;
        $response['message'] = "Location data updated.";
        $response['data']    = $favoriteLocation;
        return $response;
        
    }

    # Function is used for get Inovice On App
    # Request : Customer Id & Booking Id
    # Response : Message With POD URL
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 

    public function mobileInvoice(Request $request)
    {
        $data = $request->all();
        $result   = array();

        if(isset($data['booking_id']) && $data['booking_id'] != '')
        {
           $bookingId = $data['booking_id'];     
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
           $customerId = $data['customer_id'];     
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingDetails       = Booking::where('id', $bookingId)->where('driver_id','!=','-1')->first();

        if(count($bookingDetails) > 0)
        {
            $customer             = Customer::where('id',$customerId)->first();
            $bookingFinalData     = BookingCustomerDetails::where('booking_id', $bookingId)->first();
            $bookingCurrentStatus = BookingStatus::where('booking_id', $bookingId)->first();
            $vehicle              = VehicleCategory::where('id', $bookingDetails->vehicle_id)->first();

            if(isset($bookingCurrentStatus['complete']))
            {
                $completeTime = $bookingCurrentStatus['complete'];
                if($completeTime != '')
                {  
                    $totalBillWithoutDiscount         = 0;
                    $totalBillAmount                  = 0;
                    $result['customerTable']          = $customer;
                    $result['BookingTable']           = $bookingDetails;
                    $result['fare_breakup']           = $vehicle;
                    $totalBillAmount        = round($bookingFinalData->trip_charge + $bookingFinalData->loading_charge + $bookingFinalData->unloading_charge +$bookingFinalData->drop_points_charge + $bookingFinalData->waiting_time_charge + $bookingFinalData->actual_surge_charge + $bookingFinalData->pod_charge - $bookingFinalData->actual_discount_amount);

                    $totalBillWithoutDiscount = round($bookingFinalData->trip_charge + $bookingFinalData->loading_charge + $bookingFinalData->unloading_charge +$bookingFinalData->drop_points_charge + $bookingFinalData->waiting_time_charge + $bookingFinalData->actual_surge_charge + $bookingFinalData->pod_charge);

                    $bookingFinalData['totalBillAmount']          = $totalBillAmount;
                    $bookingFinalData['totalBillWithoutDiscount'] = $totalBillWithoutDiscount;

                    $result['bookingFinalDataTable']  = $bookingFinalData;
                    if(!empty($bookingCurrentStatus['start_time']))
                    {
                         $result['pickup_date_time'] = date('d-m-Y H:i:s', strtotime($bookingCurrentStatus->start_time));
                    }
                    if(!empty($bookingCurrentStatus['stop_time']))
                    {
                         $result['drop_date_time'] = date('d-m-Y H:i:s', strtotime($bookingCurrentStatus->stop_time));
                    }  
                }
            } 
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $result;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;
        }
        
    }

    # Function is used for get POD or Builty URL
    # Request : Customer Id & Booking Id
    # Response : Message With POD URL
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 

    public function podUrl(Request $request)
    {
        $data = $request->all();
        if(isset($data['booking_id']) && $data['booking_id'] != '')
        {
           $bookingId = $data['booking_id'];     
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
            $customerId       =  $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
       
        $booking = Booking::where('customer_id',$customerId)->where('id',$bookingId)->first();
        if($booking != '')
        {
            $baseUrl = url('/');
            $podUrl          = $baseUrl.$booking->pod_image_url;
            $response['success'] = true;
            $response['message'] = "POD sent.";
            $response['data']    = array('pod_url' => $podUrl);
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "POD sending failed.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function is used for Get All customer past booking history 
    # Request : By Customer Phone
    # Response : Message With all charges and billing data
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 

    public function getCustomerBooking(Request $request)
    {
        $data     = $request->all();
        $result   = array();
  
        if(isset($data['customer_id']))
        {
            $customerId               = $data['customer_id'];
            if($customerId != "")
            {     
                //fetching bookings details
                $bookingDetails  = Booking::where('customer_id', $customerId)->where('driver_id', '!=' ,'0')->orderBy('id','desc')->paginate(10);
                $driverIdArray  = array();
                $bookingIdArray = array();
                $cancelBookingIdArray = array();
                $vehicleIdArray = array();
                $canceledReasonArray = array();
                foreach ($bookingDetails as $key => $value) 
                {
                    array_push($driverIdArray, $value->driver_id);
                    array_push($bookingIdArray, $value->id);
                    if($value->driver_id == '-1')
                    {
                        array_push($cancelBookingIdArray, $value->id);
                    }
                }
                // return $cancelBookingIdArray;
                $canceledReasonArray  = CancellationReason::get()->keyBy('id')->toArray();
                $canceledBookingArray = CancelBooking::whereIn('booking_id', $cancelBookingIdArray)->get()->keyBy('booking_id')->toArray();
                $customerWalletArray  = CustomerLedger::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
                
                $driverDetailsArray   = Driver::select('id', 'driver_name','vehicle_reg_no','driver_number')->whereIn('id', $driverIdArray)->get()->keyBy('id')->toArray();
                
                
                $favoriteLocationDetailsArray = FavoriteLocation::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
                
                $bookingStatusDetailsArray    = BookingStatus::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
                
                $bookingFinalDetailArray = BookingCustomerDetails::whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
                $bookingEstimateArray = $bookingFinalDetailArray;
                $bookingRatingDetails = Rating::whereIn('booking_id', $bookingIdArray)->where('user_type','driver')->get()->keyBy('booking_id')->toArray();

                $customerComplaintArray = CustomerComplaint::where('customer_id', $customerId)->whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
               

                $customerLedger = CustomerLedger::where('customer_id', $customerId)->orderBy('id', 'desc')->get();
                $creditLimit          = CreditLimit::where('customer_id', $customerId)->first();
                $creditLimitAmount    = 0;
                if(isset($creditLimit->credit_limit))
                {
                    $creditLimitAmount = $creditLimit->credit_limit;
                }
                
                $mainResultArray = array();
                $multipleDropPointsArray = CustomerDropPoints::where('customer_id', $customerId)->whereIn('booking_id', $bookingIdArray)->get()->keyBy('booking_id')->toArray();
              
                $customerBalance = 0;
                
                if(count($customerLedger) > 0)
                {
                    $customerBalance = $customerLedger[0]['final_balance'];    
                }
                
                $twoDayAgo = date('d-m-Y 00:00:00', strtotime("-5 days"));
                $getCode = BookingDiscountCode::where('customer_id',$customerId)->get();
                $couponCodeIdsArray = array();
                $discountDataArray = array();
                if(count($getCode) > 0)
                {
                    foreach ($getCode as $key => $value) 
                    {
                        array_push($couponCodeIdsArray, $value->discount_coupon_id);    
                    }
                    $discountData = DiscountCouponCode::whereIn('id',$couponCodeIdsArray)->get()->keyBy('id')->toArray();
                    
                    $discountDataArray = array();
                    foreach ($getCode as $key => $value) 
                    {
                        if(array_key_exists($value->discount_coupon_id, $discountData))
                        {
                            $discountDataArray[$value->booking_id]  =  $discountData[$value->discount_coupon_id];
                        }
                        
                    }
                }
                

                $billingType = BillingType::get()->keyBy('id')->toArray();  
                $i = 0;  
                foreach ($bookingDetails as $key => $value) 
                {
                    $result = array();
                    $result['trip_charge']   = 0;  
                    $result['trip_amount']   = 0;        
                    $result['trip_distance'] = 0;      
                    $result['payment']       = 0;      
                    $result['bill']          = 0;      
                    $result['url']           = "";     
                    $result['loading_charge']= 0;
                    $result['unloading_charge']= 0;
                    $result['total_charge']= 0;
                    $result['paid_to_driver']= 0;
                    $result['pod_charge']   = 0;
                    $result['drop_points_charge']  = 0;
                    $result['discount']  = 0;
                    $result['waiting_charge']  = 0;
                    $result['customer_credit_limit']  = 0;
                    $result['credit']  = 0;
                    $result['debit']  = 0;
                    $result['surge_amount']  = 0;
                    $result['mg_money'] = 0; 
                    $result['final_balance'] = 0;
                    $result['tip'] = 0;
                    $result['minimum_time']         = 0;
                    $result['minimum_distance']     = 0;

                    $result['booking_type']   = $billingType[$value->customer_pricing_id]['type']; 

                    if(isset($canceledBookingArray[$value->id]))
                    {
                        
                        if(isset($canceledReasonArray[$canceledBookingArray[$value->id]['reason']]))
                        {
                            $result['cancellation_reason'] = $canceledReasonArray[$canceledBookingArray[$value->id]['reason']]['reason'];   
                            if($result['cancellation_reason'] == '')
                            {
                                $result['cancellation_reason'] = $canceledBookingArray[$value->id]['reason'];
                            }    
                        }
                    }
                    

                    
                    if(array_key_exists($value->id, $discountDataArray))
                    {
                        $result['applied_coupon_code'] = $discountDataArray[$value->id]['discount_code'];
                    }
                    else
                    {
                        $result['applied_coupon_code'] = '';
                    }
                    if(isset($bookingStatusDetailsArray[$value->id]['booking_time']))
                    {
                        if(!empty($bookingStatusDetailsArray[$value->id]['pod_time']) || !empty($bookingStatusDetailsArray[$value->id]['complete']) || 
                            $value->driver_id == '-1' )
                        {

                            if(isset($bookingRatingDetails[$value->id]) && $bookingRatingDetails[$value->id]['rating'])
                            {
                                $result['rating'] = $bookingRatingDetails[$value->id]['rating'];
                            }
                            else
                            {
                                $result['rating'] = 0;
                            }

                            if(isset($customerLedger[$i + 1]))
                            {
                                $result['mg_money'] = $customerLedger[$i + 1]->final_balance;    
                            }
                            else
                            {
                                $result['mg_money'] = 0;   
                            }
                            $i++;

                            if(isset($customerWalletArray[$value->id]))
                            { 
                                $result['final_balance'] = $customerWalletArray[$value->id]['final_balance'];
                                $result['credit']        = $customerWalletArray[$value->id]['credit'];
                                $result['debit']         = $customerWalletArray[$value->id]['debit'];
                            }
                            else
                            {
                                $result['final_balance'] = 0;
                                $result['credit']        = 0;
                                $result['debit']         = 0;
                            }

                            //getting driver infromation
                            if(isset($driverDetailsArray[$value->driver_id]))
                            {
                                $result['driver']          = $driverDetailsArray[$value->driver_id]['driver_name'];
                                $result['driver_number']   = $driverDetailsArray[$value->driver_id]['driver_number'];
                                $result['vehicle_reg_no']  = $driverDetailsArray[$value->driver_id]['vehicle_reg_no'];
                            }
                            else 
                            {
                                $result['driver']          = "";
                                $result['driver_number']   = "";
                                $result['vehicle_reg_no']  = ""; 
                            }
                            $result['trip_id'] = $value->id;
                            if(isset($favoriteLocationDetailsArray[$value->id]))
                            {
                                if($favoriteLocationDetailsArray[$value->id]['pickup_landmark'] != "" )
                                {
                                    $result['pick_up']     = $favoriteLocationDetailsArray[$value->id]['pickup_landmark'];
                                }
                                else
                                {
                                    $result['pick_up']     = "";     
                                }

                                if($favoriteLocationDetailsArray[$value->id]['drop_landmark'] != '')
                                {  
                                    $result['drop']        = $favoriteLocationDetailsArray[$value->id]['drop_landmark'];
                                }
                                else
                                {
                                    $result['drop']        = "";     
                                }

                                if($favoriteLocationDetailsArray[$value->id]['pickup_lat'] != "" && $favoriteLocationDetailsArray[$value->id]['pickup_lng'] != '')
                                {
                                    $result['pickup_lat']  = $favoriteLocationDetailsArray[$value->id]['pickup_lat'];    
                                    $result['pickup_lng']  = $favoriteLocationDetailsArray[$value->id]['pickup_lng'];
                                }
                                else
                                {
                                    $result['pickup_lat']  = "";
                                    $result['pickup_lng']  = "";   
                                }

                                if($favoriteLocationDetailsArray[$value->id]['drop_lat'] != '' && $favoriteLocationDetailsArray[$value->id]['drop_lng'] != '')
                                {
                                    $result['drop_lat']    = $favoriteLocationDetailsArray[$value->id]['drop_lat'];
                                    $result['drop_lng']    = $favoriteLocationDetailsArray[$value->id]['drop_lng'];
                                }
                                else
                                {
                                    $result['drop_lat']    = "";
                                    $result['drop_lng']    = "";    
                                }
                                
                            }

                            $multipleDropPoints = CustomerDropPoints::where('booking_id', $value->id)->get();
                            if ($multipleDropPoints != "") 
                            {
                                $result['drop_points']  = $multipleDropPoints;   
                            }
                            else
                            {
                                $result['drop_points']  = "";
                            }


                            $vehicleDetials = VehicleCategory::where('id', $value['vehicle_id'])->first();

                            if($vehicleDetials != '')
                            {
                                
                                $result['vehicle_name'] = $vehicleDetials['vehicle_name'];
                                
                            }
                            else
                            {
                                $result['vehicle_name'] = "";      
                            }
                            //getting trip infromtation

                            
                            $result['date']    = date("d-m-Y H:i:s", strtotime($value->requirement_time));
                            if(!empty($bookingStatusDetailsArray[$value->id]['complete']) || !empty($bookingStatusDetailsArray[$value->id]['pod_time']))
                            {  
                                $result['status']  = "Completed";
                                if(isset($bookingFinalDetailArray[$value->id]))
                                {
                                    $result['trip_charge']      = $bookingFinalDetailArray[$value->id]['trip_charge']; 
                                    $upperTripDistance = $value->upper_trip_distance;
                                    $distance = $value->actual_trip_distance;
                                    $lowerTripDistance = $value->lower_trip_distance;

                                    if($upperTripDistance < $distance)
                                    {
                                        $temp = $upperTripDistance;
                                        $distanceInMeter1 = $temp * 1000;
                                    }
                                    else 
                                    {
                                        if($distance < $lowerTripDistance)
                                        {
                                            $temp = $lowerTripDistance;
                                            $distanceInMeter1 = $temp * 1000;
                                        }
                                        else
                                        {
                                            $temp = $distance;        
                                            $distanceInMeter1 = $temp * 1000;
                                        }
                                    } 
                                    $result['trip_distance']  = $distanceInMeter1/1000; 

                                    $result['trip_distance']    = number_format($result['trip_distance'], 1, '.', '');                                    
                                    $result['payment']          = $bookingFinalDetailArray[$value->id]['payment_recevied'];

                                    $result['bill']             = $bookingFinalDetailArray[$value->id]['unloading_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['loading_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['pod_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['drop_points_charge'] +  
                                                                  $bookingFinalDetailArray[$value->id]['waiting_time_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['trip_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['actual_surge_charge'] +
                                                                  $bookingFinalDetailArray[$value->id]['tip_charge'] - 
                                                                  $bookingFinalDetailArray[$value->id]['actual_discount_amount'] ;

                                    $result['loading_charge']  =  $bookingFinalDetailArray[$value->id]['loading_charge'];
                                    $result['unloading_charge']=  $bookingFinalDetailArray[$value->id]['unloading_charge'];
                                    $result['drop_points_charge']     =  $bookingFinalDetailArray[$value->id]['drop_points_charge'];
                                    $result['pod_charge']      =  $bookingFinalDetailArray[$value->id]['pod_charge'];
                                    $result['surge_amount']    =  $bookingFinalDetailArray[$value->id]['actual_surge_charge'];
                                    $result['discount']        =  $bookingFinalDetailArray[$value->id]['actual_discount_amount'];
                                    $result['tip']             =  $bookingFinalDetailArray[$value->id]['tip_charge'];

                                    $result['waiting_charge']  =  $bookingFinalDetailArray[$value->id]['waiting_time_charge'];
                                    $result['total_charge']    =  $bookingFinalDetailArray[$value->id]['unloading_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['loading_charge'] +
                                                                  $bookingFinalDetailArray[$value->id]['pod_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['drop_points_charge'] +  
                                                                  $bookingFinalDetailArray[$value->id]['waiting_time_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['trip_charge'] + 
                                                                  $bookingFinalDetailArray[$value->id]['actual_surge_charge'] +
                                                                  $bookingFinalDetailArray[$value->id]['tip_charge'];

                                    $result['customer_credit_limit']= $creditLimitAmount;
                                    $result['paid_to_driver'] = $bookingFinalDetailArray[$value->id]['payment_recevied'];
                                    $estimatedAmount = $result['total_charge'] - $result['discount'];
                                    $result['minimum_time']  =  $value->approximately_hours;
                                    $result['minimum_distance']  =  $value->upper_trip_distance;

                                    $datetime1 = new \DateTime($value->requirement_time);
                                    $datetime2 = new \DateTime($bookingStatusDetailsArray[$value->id]['complete']);
                                    $interval = $datetime1->diff($datetime2);
                                    
                                    $result['total_trip_time']  = $interval->format('%h')." hr ".$interval->format('%i')." min";
                                    if($value->pod_image_url == NULL)
                                    {
                                        $result['url']          = ''; 
                                    }
                                    else
                                    {
                                        $baseUrl = url('/');
                                        $result['url']          = $baseUrl.$value->pod_image_url; 
                                    }
                                    
                                }
                                
                            }
                            
                            if ($value->driver_id == '-1' ) 
                            {  
                                $result['status']  = "Cancelled";
                                $result['total_trip_time']  = "0 hr 0 min" ;

                                if(isset($bookingEstimateArray[$value->id]))
                                {
                                    $result['trip_charge']   = $bookingEstimateArray[$value->id]['trip_charge']; 
                                    
                                    $result['trip_distance']    = number_format($value->upper_trip_distance, 1, '.', '');

                                    $result['payment']       = 0;

                                    $result['bill']           = $bookingEstimateArray[$value->id]['unloading_charge'] + 
                                                                $bookingEstimateArray[$value->id]['loading_charge'] + 
                                                                $bookingEstimateArray[$value->id]['pod_charge'] + 
                                                                $bookingEstimateArray[$value->id]['drop_points_charge'] + 
                                                                $bookingEstimateArray[$value->id]['waiting_time_charge'] + 
                                                                $bookingEstimateArray[$value->id]['trip_charge'] + 
                                                                $bookingEstimateArray[$value->id]['estimate_surge_charge'] +
                                                                $bookingEstimateArray[$value->id]['tip_charge'] - 
                                                                 $bookingEstimateArray[$value->id]['estimate_discount_amount'];
                                    $result['url']             = ""; 

                                    $result['loading_charge']  =  $bookingEstimateArray[$value->id]['loading_charge'];
                                    $result['unloading_charge']=  $bookingEstimateArray[$value->id]['unloading_charge'];
                                    $result['drop_points_charge']     =  $bookingEstimateArray[$value->id]['drop_points_charge'];
                                    $result['pod_charge']      =  $bookingEstimateArray[$value->id]['pod_charge'];
                                    $result['surge_amount']    =  $bookingEstimateArray[$value->id]['estimate_surge_charge'];

                                    $result['surge_percentage']=  $bookingEstimateArray[$value->id]['surge_percentage'];
                                    $result['discount']        =  $bookingEstimateArray[$value->id]['estimate_discount_amount'];
                                    $result['tip']             =  $bookingEstimateArray[$value->id]['tip_charge'];
                                    $result['total_charge']    =  $bookingEstimateArray[$value->id]['unloading_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['loading_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['pod_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['drop_points_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['waiting_time_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['trip_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['tip_charge'] + 
                                                                  $bookingEstimateArray[$value->id]['estimate_surge_charge'];
                                    $result['waiting_charge']= 0;
                                    $result['minimum_time']  =  $value->approximately_hours;
                                    $result['minimum_distance']  =  $value->upper_trip_distance;
                                    $result['customer_credit_limit']= $creditLimitAmount;
                                    $result['paid_to_driver'] = 0;
                                    $estimatedAmount = $result['total_charge'] - $result['discount'];
                                                                                                            
                                    if($customerBalance > $creditLimitAmount) {
                                       $customerBalance = $creditLimitAmount + ($customerBalance); 
                                    }
                                    else
                                    {
                                        $customerBalance = $creditLimitAmount - ($customerBalance);
                                    } 
                                    
                                    if ($customerBalance <= 0 ) {
                                        $result['paid_to_driver'] = $estimatedAmount - ($customerBalance);
                                    }
                                    if ($customerBalance > 0) {
                                        if ($estimatedAmount > $customerBalance) {
                                            $result['paid_to_driver'] = $estimatedAmount - $customerBalance;
                                        } else {
                                            $result['paid_to_driver'] = 0;
                                        }
                                    } 
                                   

                                }
                            }
                            if(strtotime($result['date']) > strtotime($twoDayAgo))
                            {   
                                if(isset($customerComplaintArray[$value->id]))
                                {
                                    if($value->driver_id == -1)
                                    {
                                        $result['complaint_flag'] = false;
                                        $result['complaint_id']   = "";
                                        $result['reason']         = "";
                                        $result['details']        = "";
                                        $result['display_flag']   = false;
                                    }
                                    else
                                    {
                                        $result['complaint_flag'] = true;
                                        $result['reason']         = $customerComplaintArray[$value->id]['reason'];
                                        $result['complaint_id']   = "MG".$customerComplaintArray[$value->id]['id'];
                                        $result['details']        = $customerComplaintArray[$value->id]['details'];
                                        $result['display_flag']   = true;
                                    }
                                    
                                }
                                else
                                {
                                    if($value->driver_id == -1)
                                    {
                                        $result['complaint_flag'] = false;
                                        $result['complaint_id']   = "";
                                        $result['reason']         = "";
                                        $result['details']        = "";
                                        $result['display_flag']   = false;
                                    }
                                    else
                                    {
                                        $result['complaint_flag'] = false;
                                        $result['complaint_id']   = "";
                                        $result['reason']         = "";
                                        $result['details']        = "";
                                        $result['display_flag']   = true;
                                    }
                                }    
                            }
                            else
                            {
                                $result['complaint_flag'] = false;
                                $result['complaint_id']   = "";
                                $result['reason']         = "";
                                $result['details']        = "";
                                $result['display_flag']   = false;
                            }
                            array_push($mainResultArray, $result);
                        }
                    }
                }
                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = array('data' => $mainResultArray , 'totalPage' => $bookingDetails->lastPage());
                return $response;
            }
            else 
            {
                $response['success'] = false;
                $response['message'] = "No record found..";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }  
    }//End getCustomerBooking function

    # Function is used for Calculate Estimation bill 
    # Request : All billing data 
    # Response : Message With all charges and billing data
    # Autor : Brijendra  
    # Modify By: Vinod Kumar 

    public function forceUpdateApp()
    {
        $result = array();
        $result['force_update']  = true;
        $response['success'] = array();
        $response['success']['message'] = "App update successful.";
        $response['success']['data']    = $result;
        return $response;
    }
    
    # Function is used for Calculate Estimation bill 
    # Request : All billing data 
    # Response : Message With all charges and billing data
    # Autor : Jyoti 
    # Modify By: Vinod Kumar 

    public function calculateOnAppEsitmated(Request $request)
    { 
        //$data     = $request->all();
        $rawData = file_get_contents("php://input");
        $data = (array) json_decode($rawData);
        
        $distancePercentage = 0;
        $distanceLowerPercentage = 0;
        $customer = NULL;
        $pick     = NULL;
        $drop     = NULL; 
        $vehicle  = NULL;
        $info     = NULL;
        $billing  = NULL;
        $totalTripCharge    = 0;
        $lowerTotalTripCharge   = 0;
        $discountAmount     = 0;
        $loading_charge     = 0;
        $unloading_charge   = 0;
        $vehicleId          = '';
        $vehicle_name       = '';
        $allowed_drop_point = 2;
        $creditLimit        = 0;
        $area = array(); 
        if(isset($data['customer_id']))
        {
            $customerDetials = Customer::find($data['customer_id']);
            if($customerDetials->status == 'inactive')
            {
                $response['success'] = false;
                $response['message'] = "This user account has been temporarily suspended. Please contact MaalGaadi for further assistance.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        
        if(isset($data['selected_vehicle_category']))
        {  
            $vehicleId = $data['selected_vehicle_category'];
            $vehicle = VehicleCategory::find($vehicleId);

            if(isset($vehicle->distance_buffer_percentage))
            { 
                $distancePercentage = $vehicle->distance_buffer_percentage;               
            } 

            if(isset($vehicle->lower_distance_buffer))
            { 
                $distanceLowerPercentage = $vehicle->lower_distance_buffer; 
            } 
            if(isset($data['goods_id']))
            {
                $goodId = $data['goods_id'];
            }
            else
            {
                $goodId = 1;
            }
            $vehicelMeta = VehicleGood::where('vehicle_id',$vehicle->id)->where('good_id',$goodId)->first();
            if($vehicelMeta != '')
            {
                $loadingCharge = $vehicelMeta->loading_charge; 
                $unloadingCharge = $vehicelMeta->unloading_charge; 
            }
            else
            {
                $loadingCharge = 60; 
                $unloadingCharge = 60; 
            } 

            if(isset($vehicle->vehicle_name))
            { 
                $vehicleName = $vehicle->vehicle_name; 
            } 

            if(isset($vehicle->pod_charge))
            { 
                $podCharge = $vehicle->pod_charge; 
            }
            
            if(isset($vehicle->allowed_drop_point))
            { 
                $allowedDropPoint = $vehicle->allowed_drop_point; 
            }
            //for hourly
            if(isset($vehicle->base_distance))
            { 
                $baseDistance = $vehicle->base_distance; 
            } 
            else
            {
                $baseDistance = 3;
            }
            
            if(isset($vehicle->rate))
            { 
                $ratePerKm = $vehicle->rate;              
            }
            else
            {
                $ratePerKm = 10;
            }
            
            if(isset($vehicle->base_fare))
            { 
                $baseFare = $vehicle->base_fare; 
            }
            else
            {
                $baseFare = 180;
            }
            
            if(isset($vehicle->hourly_rate))
            { 
                $hourlyRate = $vehicle->hourly_rate; 
            }
            else
            {
                $hourlyRate = 150;
            }    
            
            if(isset($vehicle->rate_per_drop_point))
            {
                $ratePerDropPoint = $vehicle->rate_per_drop_point;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Vehicle category is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['physical_pod']) && ($data['physical_pod'] == true))
        {
            $resultArray['pod'] = 1;   
            $resultArray['pod_charge'] = $podCharge; 
        }
        else
        {
            $resultArray['pod'] = 0;    
            $resultArray['pod_charge'] = 0; 
        }

        if(isset($data['electronic_pod']) && ($data['electronic_pod'] == true))
        {
            $resultArray['e_pod'] = 1;    
        }
        else
        {
            $resultArray['e_pod'] = 0;    
        }

        if(isset($data['booking_type']))
        {
            $bookingType = $data['booking_type'];
        }
        else
        {
            $bookingType = 'normal'; 
        }

        if(isset($data['unloading']) &&  ($data['unloading'] == true))
        {
            $resultArray['unloading'] = 1;    
        }
        else
        {
            $resultArray['unloading'] = 0;    
        }
        
        if(isset($data['loading']) && ($data['loading'] == true))
        {
            $resultArray['loading'] = 1;    
        }
        else
        {
            $resultArray['loading'] = 0;
        }
        $origins = NULL;
        if(isset($data['landmark_list']) && $data['landmark_list'] != '')
        {
            $landmarkListArray = $data['landmark_list'];
            $count = count($landmarkListArray);
            for ($i=0; $i < $count ; $i++) 
            { 
                if($landmarkListArray[$i]->is_pickup == true)
                {
                    $origins = $landmarkListArray[$i]->latitude.','.$landmarkListArray[$i]->longitude;
                    $resultArray['pick_lat'] = $landmarkListArray[$i]->latitude;
                    $resultArray['pick_lng'] = $landmarkListArray[$i]->longitude;
                    $data['pic_address'] = $landmarkListArray[$i]->landmark;
                    if($landmarkListArray[$i]->is_favorite == true)
                    {
                        $resultArray['is_favorite_pickup'] = 1;
                    }
                }
            }
        }

        if($origins == NULL)
        { 
            $response['success'] = false;
            $response['message'] = "Pickup point is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $resultArray['minimum_time'] = 0;
        if($bookingType == 'normal')
        {
            $distanceMeter = 0; 
            $distance      = '0 Kms'; 
            $time          = 0; 
            $timeText      = '0 min'; 
            $distance      = $distanceMeter/1000;
            $destination = NULL;

            if($origins != NULL)
            { 
                $key = $count - 1;
                if($landmarkListArray[$key]->latitude != '0.0' &&  $landmarkListArray[$key]->longitude != '0.0')
                {
                    $destination =  $landmarkListArray[$key]->latitude.','.$landmarkListArray[$key]->longitude; 
                    $resultArray['drop_lat'] =  $landmarkListArray[$key]->latitude;
                    $resultArray['drop_lng'] = $landmarkListArray[$key]->longitude;
                    $data['drop_address'] = $landmarkListArray[$key]->landmark;
                    if($landmarkListArray[$key]->is_favorite == true)
                    {
                        $resultArray['is_favorite_drop'] = 1;
                    }
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Drop points is required.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Drop points is required.";
                $response['data']    = (object) array();
                return $response;
            }
            

            $landmarkListArray = $data['landmark_list'];
            if($origins != NULL && $destination != NULL)
            {
                $wayponts = '';
                $countPoint = 0;
                $count = count($landmarkListArray);
                for ($i=1; $i < $count ; $i++) 
                { 
                    if($landmarkListArray[$i]->is_pickup == false)
                    {
                        if($wayponts != '')
                        {
                            $wayponts = $wayponts.'|';
                        }
                        $wayponts = $wayponts.$landmarkListArray[$i]->latitude.','.$landmarkListArray[$i]->longitude; 
                    } 
                }
            }
            $getFavLocation = '';
            if(count($landmarkListArray) == 2 )
            {
                $getFavLocation = FavoriteLocation::where('pickup_lat',$resultArray['pick_lat'])->where('pickup_lng',$resultArray['pick_lng'])->where('drop_lat',$resultArray['drop_lat'])->where('drop_lng',$resultArray['drop_lng'])->first();
            }
            
            if($getFavLocation != '' && $getFavLocation->distance_meter != 0)
            {
                $distanceMeter = $getFavLocation->distance_meter;
                $durationMin   = $getFavLocation->time;
                $timeText      = $getFavLocation->time_text;
                $distance      = number_format($distanceMeter/1000, 1, '.', '');
            }
            else if(isset($data['landmark_list']))
            {
                //$url="https://maps.googleapis.com/maps/api/directions/json?origin=".$data['pic_address']."&destination=".$data['drop_address']."&sensor=false&waypoints=".$wayponts."&transit_mode=bus&".Config::get('constants.keyValue')."=".Config::get('constants.googleserverkey');  
                //$url           = "https://maps.googleapis.com/maps/api/distancematrix/json?".Config::get('constants.keyValue')."=".Config::get('constants.googleserverkey')."&origins=".$origins."&destinations=".$destination."&waypoints=".$wayponts."";
                
                $url = "https://maps.googleapis.com/maps/api/directions/json?origin=".$origins."&destination=".$destination."&sensor=false&waypoints=".$wayponts."&transit_mode=DRIVING&key=".Config::get('constants.googleserverkey');
                
                $json          = @file_get_contents($url); 
                $dataDistance = json_decode($json); 
                if(!isset($dataDistance->routes[0]->legs))
                {
                    $response['success'] = false;
                    $response['message'] = "Please check your pick and drop address.";
                    $response['data']    = array('invalid_address' => true);
                    return $response;
                }
                $count = count($dataDistance->routes[0]->legs);
                $distanceMeter = 0;
                $durationSec = 0;
                for($p = 0;$p < $count; $p++)
                {
                    $CountBtwWay = count($dataDistance->routes[0]->legs[$p]->steps);
                    //calculate distance btw A to B  for all the route btw him
                    for($m = 0; $m < $CountBtwWay; $m++)
                    {
                        $distanceMeter = $distanceMeter + $dataDistance->routes[0]->legs[$p]->steps[$m]->distance->value;
                        $durationSec = $durationSec + $dataDistance->routes[0]->legs[$p]->steps[$m]->duration->value;
                    } 
                }
            
                $distance      = $distanceMeter/1000;  //distanceKM
                $distance      = number_format($distanceMeter/1000, 1, '.', ''); 
                $durationMin   = round($durationSec/60);
                $time          = $durationSec;
                $timeText      = $durationMin;
                $resultArray['trip_time'] = $durationMin;
                $updateFavLocation = FavoriteLocation::where('pickup_lat',$resultArray['pick_lat'])->where('pickup_lng',$resultArray['pick_lng'])->where('drop_lat',$resultArray['drop_lat'])->where('drop_lng',$resultArray['drop_lng'])->first();
                if($updateFavLocation != '')
                {
                    $updateFavLocation->distance_meter = $distanceMeter;
                    $updateFavLocation->distance = number_format($distanceMeter/1000, 1, '.', ''); ;
                    $updateFavLocation->time = $durationSec;
                    $updateFavLocation->time_text = $durationMin;
                    $updateFavLocation->save();
                }
            
            }
            $maxAllowDistance = 80;
            $maalgaadiSettings = MaalgaadiSettings::where('city_id',$vehicle->city_id)->first();
            if($maalgaadiSettings != '')
            {
                $maxAllowDistance = $maalgaadiSettings->max_allow_distance;
            }
                        
            if($distance > $maxAllowDistance)
            {
                $response['success'] = false;
                $response['message'] = "For bookings with trip distance more than $maxAllowDistance km, please contact us on ".$maalgaadiSettings->customer_care_contact.".";
                $response['data']    = array('max_limit_cross' => true);
                return $response;
            }

            //  Estimated upper   Distance 
            $resultArray['upper_estimated_distance_in_meter'] = $distanceMeter + round(($distanceMeter * $distancePercentage)/100);
            // Estimated lower Distance 
            $resultArray['lower_estimated_distance_in_meter'] = $distanceMeter - round(($distanceMeter * $distanceLowerPercentage)/100);
            $upperDistanceInKm  = number_format((($distanceMeter + round(($distanceMeter * $distancePercentage)/100)) / 1000), 1, '.', '');  //km converted
            $lowerDistanceInKm = number_format((($distanceMeter - round(($distanceMeter * $distanceLowerPercentage)/100)) / 1000), 1, '.', '');
            
            $resultArray['upper_estimated_distance_in_km'] = $upperDistanceInKm;
            $resultArray['lower_estimated_distance_in_km'] = $lowerDistanceInKm;
            if($vehicleId != "")
            {   
                $mainDistance = 0;
                $mainDistance = $upperDistanceInKm - $baseDistance;
                $totalTripCharge = round($totalTripCharge + ($baseFare + ($ratePerKm * $mainDistance)));
                if($totalTripCharge > $baseFare)
                { 
                    $resultArray['upper_trip_charge'] = round($totalTripCharge);
                }
                else
                {
                    $resultArray['upper_trip_charge'] = round($baseFare);
                    $totalTripCharge = round($baseFare);            
                }
                
                $lowerDistance = 0;
                $lowerDistance = $lowerDistanceInKm - $baseDistance;            
                $lowerTotalTripCharge = round($lowerTotalTripCharge + ($baseFare + ($ratePerKm * $lowerDistance)));
                if($lowerTotalTripCharge < $baseFare)
                {
                    $resultArray['lower_trip_charge'] = round($baseFare);
                    $lowerTotalTripCharge             = round($baseFare);
                }
                else
                {
                    $resultArray['lower_trip_charge'] = round($lowerTotalTripCharge);
                }
            }
            //drop point charge calculation
            $resultArray['drop_point_charge'] = 0;
            if(isset($data['number_of_drop_points']))
            {
                if($data['number_of_drop_points'] > $allowedDropPoint)
                {
                    //if drop point are greater then allowed then add drop point charge
                    $dropPoint = $data['number_of_drop_points'] - $allowedDropPoint;                    
                    $totalTripCharge = $totalTripCharge + ($dropPoint * $ratePerDropPoint);
                    $lowerTotalTripCharge = $lowerTotalTripCharge + ($dropPoint * $ratePerDropPoint);
                    $resultArray['drop_point_charge'] = ($dropPoint * $ratePerDropPoint);
                }
            }
            
            $resultArray['unloading_charge'] = 0;   
            
            if(isset($data['unloading']) && $data['unloading'] == true)
            {
                $totalTripCharge = $totalTripCharge + $unloadingCharge;
                $lowerTotalTripCharge = $lowerTotalTripCharge + $unloadingCharge;
                $resultArray['unloading_charge'] = $unloadingCharge;           
            }
            
            $resultArray['loading_charge']   = 0;   
            
            if(isset($data['loading']) && $data['loading'] == true)
            {
                $totalTripCharge = $totalTripCharge + $loadingCharge;
                $lowerTotalTripCharge = $lowerTotalTripCharge + $loadingCharge;
                $resultArray['loading_charge']   = $loadingCharge;
            }
                
            $totalTripCharge = $totalTripCharge + $resultArray['pod_charge'];
            $lowerTotalTripCharge = $lowerTotalTripCharge + $resultArray['pod_charge'];
            $resultArray['booking_type'] ='normal';
            $area = array(
                    'pick_lat' => $resultArray['pick_lat'],
                    'pick_lng' => $resultArray['pick_lng'],
                    'drop_lat' => $resultArray['drop_lat'],
                    'drop_lng' => $resultArray['drop_lng'],
                    'booking_schedule_time' => date('Y-m-d H:i:s', strtotime($data['booking_time']))
                    );
        }
        else if($bookingType == 'hourly')
        {
            $estimatedHrs            = $data['minimum_time'];
            $resultArray['minimum_time'] = $data['minimum_time'];
            $resultArray['trip_time'] = $data['minimum_time']*60;
            $estimatedHoursCharge    = $estimatedHrs * $hourlyRate;
            $estimatedDistance       = $data['minimum_distance'];    
            $distance                = $estimatedDistance - $baseDistance;
            $estimatedDistanceCharge = ($distance * $ratePerKm) + $baseFare;
            $totalTripCharge = 0;
            if($estimatedHoursCharge < $estimatedDistanceCharge)
            {
                $totalTripCharge = $estimatedDistanceCharge;
            }
            else
            {
                $totalTripCharge = $estimatedHoursCharge;
            }
            // in case of hourly only single trip chanrge return it a trip_charege
            if($totalTripCharge > $baseFare)
            {
                $resultArray['upper_trip_charge'] = $totalTripCharge;
            }
            else
            {
                $resultArray['upper_trip_charge'] = $baseFare;
                $totalTripCharge = $baseFare;
            }
            $totalTripCharge = $totalTripCharge + $resultArray['pod_charge'];

            $resultArray['unloading_charge'] = 0;   
            
            if(isset($data['unloading']) && $data['unloading'] == true)
            {
                $totalTripCharge = $totalTripCharge + $unloadingCharge;
                $resultArray['unloading_charge'] = $unloadingCharge;           
            }
            
            $resultArray['loading_charge']   = 0;   
            
            if(isset($data['loading']) && $data['loading'] == true)
            {
                $totalTripCharge = $totalTripCharge + $loadingCharge;
                $resultArray['loading_charge']   = $loadingCharge;
            }
            
            $resultArray['upper_estimated_distance_in_meter'] = $estimatedDistance*1000;
            $resultArray['upper_estimated_distance_in_km']    = $data['minimum_distance'];
            $resultArray['lower_estimated_distance_in_km']    = 0;
            
            $resultArray['upper_estimated_distance_in_meter'] = number_format($resultArray['upper_estimated_distance_in_meter'], 1, '.', '');
            $resultArray['estimated_distance']                = $data['minimum_distance'];
            $resultArray['estimated_distance']                = number_format($resultArray['estimated_distance'], 1, '.', '');
            $resultArray['estimated_hrs']                     = $data['minimum_time'];  
            //blank param from normal booking as param nehas request
            $resultArray['drop_point_charge']                 = 0;
            $resultArray['booking_type']                      = 'hourly';
            // end blank param from normal booking
        }
        $bookScheduleTime = '';
        if(isset($data['booking_time']))
        {
            $bookScheduleTime = date('Y-m-d H:i:s', strtotime($data['booking_time']));
        }
        else 
        {
            $bookScheduleTime = date('Y-m-d H:i:s');
        }
        $resultArray['surge_amount']        = 0;
        $resultArray['surge_percentage']    = 0;
        $tripSurgeAmount                    = 0;
        $vehicleId  = $data['selected_vehicle_category'];
        $customerId = $data['customer_id'];
        $tripAmount = $totalTripCharge;
        
        $settingKey = 'allow_'.$bookingType;

        $getSetting = SurgeSetting::where('vehicle_id',$vehicleId)->first();

        if($getSetting != '' && $getSetting->$settingKey == 1) 
        {

            $specialFunction = new CommonFunctionController;
            $surgeResponse = $specialFunction->surgeCalculation($customerId, $vehicleId, $tripAmount,'',$area, $bookScheduleTime);
            $resultArray['surge_amount']        = $surgeResponse['totalSurgeAmount'];
            $tripSurgeAmount                    = $surgeResponse['totalSurgeAmount'];
            $resultArray['surge_percentage']    = $surgeResponse['totalSurgePercentage'];  
        } 
        
        $totalTripCharge = $totalTripCharge + $tripSurgeAmount;
        $lowerTotalTripCharge = $lowerTotalTripCharge + $tripSurgeAmount;
        $resultArray['tip'] = 0;
        $resultArray['discount_amount'] = 0;
        
        if(isset($data['tip']) && $data['tip'] != 0)
        {
           $totalTripCharge = $totalTripCharge + $data['tip'];
           $lowerTotalTripCharge = $lowerTotalTripCharge + $data['tip'];
           $resultArray['tip'] = $data['tip'];
        }
        
        if(isset($data['pic_address']))
        {
            $resultArray['pic_address'] = $data['pic_address'];
        }

        if(isset($data['drop_address']))
        {
            $resultArray['drop_address'] = $data['drop_address'];  
        }

        if(isset($data['booking_time']))
        {
            $resultArray['booking_time'] = $data['booking_time'];
        }
        else 
        {
            $resultArray['booking_time'] = date('d/m/Y H:i:s');
        }
 
        $resultArray['vehicle_name'] = $vehicleName;
        if($bookingType=='normal')
        {
            $resultArray['upper_estimated_bill'] = $totalTripCharge ;          
            $resultArray['lower_estimated_bill'] = $lowerTotalTripCharge ;
        }

        if($bookingType=='hourly')
        {
            $resultArray['upper_estimated_bill'] = $totalTripCharge ;
            $resultArray['lower_estimated_bill'] = $totalTripCharge ;
        }
        

        if(isset($data['customer_id']))
        {
           $balance = $this->customerBalance($data['customer_id']);
        }
        else
        {
            $balance = 0;
        }

        if(isset($data['customer_id']))
        {
           $creditLimit = $this->customerCredit($data['customer_id']);
        }
        else
        {
            $creditLimit = 0;
        }
        $resultArray['credit_limit'] = $creditLimit;
        $resultArray['customer_balance'] = $balance;
        $customerBalance = 0;
        $paymentReceived = 0;
        $customerBalance = $balance + $creditLimit;
        $finalTripAmount = $totalTripCharge;

        if($customerBalance < 0)
        {
            $paymentReceived = $finalTripAmount - $customerBalance;
        }
        else if($customerBalance > 0)
        {
            if($finalTripAmount > $customerBalance)
            {
                $paymentReceived = $finalTripAmount - $customerBalance;
            }
            else
            {
                $paymentReceived = 0;
            }
        } 
        else if($customerBalance == 0)
        {
            $paymentReceived = $totalTripCharge;
        }
        $final_amount=$totalTripCharge - ($balance);
        $resultArray['final_amount'] = ceil($paymentReceived / 10) * 10;

        $response['success'] = true;
        $response['message'] = "Record found.";
        $response['data']    = $resultArray;
        return $response;
    } 

    # Function : This function is  used for Add new booking 
    # Request : All booking parameter
    # Response : All charges 
    # responseCode => 0 Regular Booking Added But Driver not avilable
    # responseCode => 1 Regular Booking Added and Driver avilable to allot
    # responseCode => 2 Fav Booking Added But Driver not avilable
    # responseCode => 3 Fav Booking Added and Driver avilable to allot
    # Autor : Vinod Kumar
    
    public function addCustomerBooking(Request $request)
    {
        $convertText = new TranslateClient();
        $convertText->setSource('en');
        $convertText->setTarget('hi');
        //$data     = $request->all();
        $rawData = file_get_contents("php://input");
        $data = (array) json_decode($rawData);
        
        if(isset($data['customer_id']))
        {
            
            $getCustomer = Customer::find($data['customer_id']);
            $customerId = $data['customer_id'];
            if($getCustomer->status == 'inactive')
            {
                $response['success'] = false;
                $response['message'] = "This user account has been temporarily suspended. Please contact MaalGaadi for further assistance.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['selected_vehicle_category']))
        { 
            $vehicleId = $data['selected_vehicle_category'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Vehicle category Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        
        if(!isset($data['booking_estimate']))
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingEstimate = (array) $data['booking_estimate']->data;
        $otherGood = '';
        $goodId    = '';
        $good      = '';
        $goodType  = '';
        $bookLater = '';
        $remark    = '';
        $numberOfDropPoints = 1;
        $coveredStatus      = 1;

        if(isset($data['goods_id']))
        {
            $goodId = $data['goods_id'];
        }
        else
        {
            $goodId = 1;
        }
        
        if($goodId != '')
        { 
            $good = GoodsType::find($goodId);
            if($good != '') 
            {
                $goodType = $good->goods_name;
            }
        }
        if($goodType == 'Others')
        {
            if(isset($data['goods_type']))
            {
                $otherGood = $data['goods_type'] ; 
                $goodType = $otherGood;
            }
        }
        
        if(isset($data['booking_time']))
        {
            $bookingScheduleTime = strtotime($data['booking_time']);
        }
        else
        {
           $bookingScheduleTime = strtotime(date('Y-m-d H:i:s'));
        }

        $currentTimeInSecond = strtotime(date('Y-m-d H:i:s'));
        
        $setting    = MaalgaadiSettings::where('city_id', $getCustomer->city_id)->first();
        if($bookingScheduleTime == 0 || $bookingScheduleTime < $currentTimeInSecond)
        {
            $bookingScheduleTime = strtotime("+5 minutes", strtotime(date('Y-m-d H:i:s')));
        }
        
        if(isset($data['remark']))
        {
            $remark = $data['remark'];
        }
        
        if(isset($data['number_of_drop_points']) && $data['number_of_drop_points'] != 0)
        {
           $numberOfDropPoints = $data['number_of_drop_points'];
        }
        
        $checkVehicle = VehicleCategory::find($vehicleId);  
        if($checkVehicle->allow_covered == 0)
        {
            $data['covered'] = false;
        }     
        if(isset($data['covered']) && $data['covered'] != true)
        { 
            $coveredStatus = 0; 
        }
        
        if(isset($bookingEstimate['upper_estimated_distance_in_meter']))
        {
            $upperEstimatedDistance = $bookingEstimate['upper_estimated_distance_in_meter'];
        }
        else
        {
           $upperEstimatedDistance = 0;
        }
        if(isset($bookingEstimate['lower_estimated_distance_in_meter']))
        {
           $lowerEstimatedDistance = $bookingEstimate['lower_estimated_distance_in_meter'];
        }
        else
        {
           $lowerEstimatedDistance = 0;
        }
        if(isset($bookingEstimate['pod']))
        {
            $pod = $bookingEstimate['pod']; 
            $podCharge = $bookingEstimate['pod_charge'];
        }
        else
        {
            $pod = 0;
            $podCharge = 0;
        }

        if(isset($bookingEstimate['e_pod']))
        {
            $ePod = $bookingEstimate['e_pod']; 
        }
        else
        {
            $ePod = 0;
        } 

        if(isset($bookingEstimate['loading']) && $bookingEstimate['loading'] == true)
        {
            $loading = 1;
        }
        else
        {
            $loading = 0;
        }

        if(isset($bookingEstimate['unloading']) && $bookingEstimate['unloading'] == true)
        {
            $unloading = 1;
        }
        else
        { 
           $unloading = 0;
        }
        if(isset($bookingEstimate['trip_time']) && $bookingEstimate['trip_time'] != 0)
        {
            $tripTime = $bookingEstimate['trip_time'];
        }
        else
        { 
            $tripTime = 0;
        }
        
        if($data['booking_type'])
        { 
            $bookingType = $data['booking_type'];
        }
        else
        {
            $bookingType = 'normal';
        }

        if(isset($data['minimum_time']))
        { 
            $hourlyEstTime = $data['minimum_time'];
        }
        else
        {
            $hourlyEstTime = 0;
        } 
        
        if(isset($data['mobile_number']))
        {
            $pickupNumber = $data['mobile_number'];
        }
        else
        {
            $pickupNumber = 0;
        }
        
        if(isset($data['mobile_number']))
        {
            $dropMobile = $data['mobile_number'];
        }
        else
        {
            $dropMobile = 0;
        }
        
        if(isset( $bookingEstimate['pic_address']))
        { 
           $pickupLandmark = $bookingEstimate['pic_address'];
        }
        else
        {
            $pickupLandmark = '';
        }
        
        if(isset($bookingEstimate['drop_address']))
        {
             $dropLandmark = $bookingEstimate['drop_address'];
        }
        else
        {
            $dropLandmark = '';
        }     

        if(isset($bookingEstimate['pick_lat']))
        {
            $pickupLat = $bookingEstimate['pick_lat'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Pickup point is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($bookingEstimate['pick_lng']))
        {
           $pickupLng = $bookingEstimate['pick_lng'];
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Pickup point is required.";
            $response['data']    = (object) array();
            return $response;
        }
       
        if(isset($bookingEstimate['drop_lat']))
        {
            $dropLat = $bookingEstimate['drop_lat'];
        }
        else
        {
            $dropLat = 0;
        }
        
        if(isset($bookingEstimate['drop_lng']))
        {
            $dropLng = $bookingEstimate['drop_lng'];
        }
        else
        {
            $dropLng = 0;
        }
        
        if(isset($bookingEstimate['is_favorite_pickup']) && ($bookingEstimate['is_favorite_pickup']== 1) )
        {
            $isFavoritePickup = 1;
        }
        else
        {
            $isFavoritePickup = 0;
        }

        if(isset($bookingEstimate['is_favorite_drop']) && ($bookingEstimate['is_favorite_drop'] == 1) )
        {
            $isFavoriteDrop = 1;
        }
        else
        {
            $isFavoriteDrop = 0;
        }

        if($bookingType == 'hourly')
        {
            $lowerEstimatedDistance = $data['minimum_distance'];
        }
        if(isset($data['payment_at_pickup']) && $data['payment_at_pickup'] == true)
        { 
            $paymentOption = 'pre';
        }
        else
        {
            $paymentOption = 'post';
        } 
        $favouriteDriverReq = 0;
        if(isset($data['allot_to_fav_driver']) && $data['allot_to_fav_driver'] == true)
        {
            $favouriteDriverReq = 1;
        }
        
        if(isset($data['random_code']) && $data['random_code'] != '')
        {
            $randomCode = $data['random_code'];
        }
        else
        {
            $randomCode = '';
        }

        if(isset($data['booking_event_type']) && $data['booking_event_type'] != '')
        {
            $bookingEventType = $data['booking_event_type'];
        }
        else
        {
            $bookingEventType = 'NEW';
        }

        if(isset($data['book_later']) && $data['book_later'] != '')
        {
            $bookLater = $data['book_later'];
        }
       
        $billingType = BillingType::where('type',$bookingType)->first();

        $booking = new Booking;
        $booking->customer_id        = $customerId;
        $booking->city_id            = $getCustomer->city_id;
        $booking->employee_id        = 44;
        $booking->vehicle_id         = $vehicleId;
        $booking->driver_id          = 0;
        $booking->notes              = '';
        $booking->goods_id           = $goodId;
        $booking->payment_option     = $paymentOption;
        $booking->drop_points        = $numberOfDropPoints;
        $booking->requirement_time   = date('Y-m-d H:i:s',$bookingScheduleTime);
        $booking->allotment_type     = 0;
        $booking->other_goods_text   = $otherGood;
        $booking->current_status     = 'booked';
        $booking->covered_required   = $coveredStatus;
        $booking->upper_trip_distance   = round(($upperEstimatedDistance/1000),2); 
        $booking->estimate_upper_trip_distance  = round(($upperEstimatedDistance/1000),2); 
        $booking->lower_trip_distance   = round(($lowerEstimatedDistance/1000),2); 
        $booking->phy_pod_required   = $pod;
        $booking->e_pod_required     = $ePod;
        $booking->loading_required   = $loading;
        $booking->unloading_required = $unloading;
        $booking->customer_pricing_id = $billingType->id;
        $booking->driver_pricing_id  = $billingType->id;
        $booking->approximately_hours = $hourlyEstTime;
        $booking->navigation_required = $isFavoritePickup;
        $booking->favourite_driver_required = $favouriteDriverReq;
        $booking->random_code        = $randomCode;
        $booking->booking_event_type        = $bookingEventType;
        $booking->trip_time        = $tripTime;
        $booking->book_later       = $bookLater;
        $booking->created_at         = date('Y-m-d H:i:s');

        $booking->save();
        $bookingID = $booking->id;
        
        $bookingStatus               = new BookingStatus;
        $bookingStatus->booking_id   = $booking->id;
        $bookingStatus->booking_time = date('Y-m-d H:i:s',$bookingScheduleTime);
        $bookingStatus->save();

        $favoriteLocation                      =  new FavoriteLocation;
        $favoriteLocation->booking_id          =  $bookingID;
        $favoriteLocation->customer_id         =  $customerId;
        $favoriteLocation->pickup_number       =  $pickupNumber;
        $favoriteLocation->drop_number         =  $dropMobile; 
        $favoriteLocation->pickup_landmark     =  $pickupLandmark;
        $favoriteLocation->drop_landmark       =  $dropLandmark;
        $favoriteLocation->pickup_lat          =  $pickupLat;
        $favoriteLocation->pickup_lng          =  $pickupLng;
        $favoriteLocation->drop_lat            =  $dropLat;
        $favoriteLocation->drop_lng            =  $dropLng;
        $favoriteLocation->is_favourite_pickup =  $isFavoritePickup;
        $favoriteLocation->is_favourite_drop   =  $isFavoriteDrop;
        $favoriteLocation->save();
        // Discount Code 
        if(isset($bookingEstimate['discount_code_id']) && $bookingEstimate['discount_code_id'] != '')
        {
            $discountCodeId = $bookingEstimate['discount_code_id'];
            $code = new BookingDiscountCode;
            $code->booking_id = $bookingID;
            $code->customer_id = $customerId;
            $code->discount_coupon_id = $discountCodeId;
            $code->created_at = date('Y-m-d H:i:s');
            $code->save();
            $discountId = $code->id;
            $booking = Booking::find($bookingID);
            $booking->discount_coupon_id = $discountId;
            $booking->save();
        }

        $dropPoints ='';    
        if(isset($data['landmark_list']) && $data['landmark_list'] != '')
        {
            $landmarkListArray = $data['landmark_list'];
            $count = count($landmarkListArray);
            for ($i=0; $i < $count ; $i++) 
            { 
                if($landmarkListArray[$i]->is_pickup == true)
                {
                    $origins = $landmarkListArray[$i]->latitude.','.$landmarkListArray[$i]->longitude;
                    $resultArray['pick_lat'] = $landmarkListArray[$i]->latitude;
                    $resultArray['pick_lng'] = $landmarkListArray[$i]->longitude;
                    $data['pic_address'] = $landmarkListArray[$i]->landmark;
                }
            }
        }
        if(isset($data['landmark_list']) && $data['landmark_list'] != '')
        { 
            $dropPoints = $data['landmark_list'];
        }
        if($dropPoints != '' && $numberOfDropPoints > 1)
        {
            $countLoc = count($dropPoints);
            $countLoc = $countLoc - 1;
            foreach ($dropPoints as $key => $value) 
            {   
                if($value->is_pickup == false && $key != $countLoc ) 
                {
                    if($value->is_favorite == 'true' ) 
                    {
                        $favorite = 1;
                    }
                    else
                    {
                        $favorite = 0;
                    }
                    $multipleDropPoints                      =  new CustomerDropPoints;
                    $multipleDropPoints->customer_id         =  $customerId;
                    $multipleDropPoints->booking_id          =  $bookingID;
                    $multipleDropPoints->drop_number         =  ''; 
                    $multipleDropPoints->drop_landmark       =  $value->landmark;
                    $multipleDropPoints->drop_lat            =  $value->latitude;
                    $multipleDropPoints->drop_lng            =  $value->longitude;
                    $multipleDropPoints->is_favourite        =  $favorite;
                    $multipleDropPoints->save();
                }
            }
        }
        if(isset($bookingEstimate['upper_trip_charge']))
        {
            $tripCharge = $bookingEstimate['upper_trip_charge'];
        }
        else 
        {
            $tripCharge = 0;
        }
        
        if(isset($bookingEstimate['lower_trip_charge']))
        {
            $lowerTripCharge = $bookingEstimate['lower_trip_charge']; 
        }
        else
        {
            if($data['booking_type'] == 'hourly')
            {
                $lowerTripCharge = $tripCharge;
            }
            else
            {
                $lowerTripCharge = 0;
            }
        }
        if(isset($data['tip']) && $data['tip'] != '')
        {
            $tipCharge = $data['tip'];
        }
        else
        {
            $tipCharge = 0;
        }
        if(isset($bookingEstimate['loading_charge']))
        {
            $loadingCharge = $bookingEstimate['loading_charge'];
        }
        else
        {
            $loadingCharge = 0;
        }

        if(isset($bookingEstimate['unloading_charge']))
        {
            $unloadingCharge = $bookingEstimate['unloading_charge'];
        }
        else 
        {
            $unloadingCharge = 0;
        }
       
        if($bookingEstimate['discount_amount'])
        {
            $discountAmount = $bookingEstimate['discount_amount'];
        }
        else
        {
            $discountAmount = 0;
        }
        if($bookingEstimate['cashback_amount'])
        {
            $cashbackAmount = $bookingEstimate['cashback_amount'];
        }
        else
        {
            $cashbackAmount = 0;
        }
        
        if(isset($bookingEstimate['surge_amount']))
        { 
            $surgeAmount = $bookingEstimate['surge_amount'];
        }
        else
        {
            $surgeAmount = 0;
        }

        if(isset($bookingEstimate['surge_percentage']))
        { 
            $surgePercentage = $bookingEstimate['surge_percentage'];
        }
        else
        {
            $surgePercentage = 0;
        }

        if(isset($bookingEstimate['drop_point_charge']))
        { 
            $dropPointCharge = $bookingEstimate['drop_point_charge'];
        }
        else
        {
            $dropPointCharge = 0;
        }

        $bookingCustomerDetails                     = new BookingCustomerDetails;
        $bookingCustomerDetails->booking_id         = $booking->id;
        $bookingCustomerDetails->estimate_upper_trip_charge  = $tripCharge;
        $bookingCustomerDetails->trip_charge        = $tripCharge;
        $bookingCustomerDetails->lower_trip_charge  = $lowerTripCharge;
        $bookingCustomerDetails->loading_charge     = $loadingCharge;
        $bookingCustomerDetails->unloading_charge   = $unloadingCharge;
        $bookingCustomerDetails->drop_points_charge = $dropPointCharge;
        $bookingCustomerDetails->pod_charge         = $podCharge;
        $bookingCustomerDetails->estimate_surge_charge  = $surgeAmount;
        $bookingCustomerDetails->estimate_discount_amount  = $discountAmount;
        $bookingCustomerDetails->estimate_cashback_amount  = $cashbackAmount;
        $bookingCustomerDetails->surge_percentage  = $surgePercentage;
        $bookingCustomerDetails->reference_text    = $remark;
        $bookingCustomerDetails->tip_charge        = $tipCharge;
        $bookingCustomerDetails->save();
        $mgBonus = 0;
        $mgBonusPercentage = 0;
        if($bookingCustomerDetails->estimate_surge_charge != 0)
        {
            $tripAmount = $bookingCustomerDetails->trip_charge + $bookingCustomerDetails->loading_charge + $bookingCustomerDetails->unloading_charge + $bookingCustomerDetails->pod_charge + $bookingCustomerDetails->drop_points_charge + $bookingCustomerDetails->tip_charge;
            $timeSchedule = date('Y-m-d H:i:s',$bookingScheduleTime);
            $area = array(
                    'pick_lat' => $pickupLat,
                    'pick_lng' => $pickupLng,
                    'drop_lat' => $dropLat,
                    'drop_lng' => $dropLng,
                    'booking_schedule_time' => $timeSchedule
                    );
            $commonFunction = new CommonFunctionController;
            $driverSurgeData = $commonFunction->driverSurgeCalculation($customerId, $vehicleId, $tripAmount ,$area, $timeSchedule);
            
            $mgBonus = $driverSurgeData['estimate_driver_surge_charge'];
            $mgBonusPercentage = $driverSurgeData['estimate_driver_surge_percentage']; 

            $settingKey = 'allow_'.$bookingType;

            $getSurgeSetting = SurgeSetting::where('vehicle_id', $vehicleId)->first();

            if($getSurgeSetting != '' && $getSurgeSetting->$settingKey == 1) 
            {

                $response = $commonFunction->surgeCalculation($customerId, $vehicleId, $tripAmount,'', $area, $timeSchedule); 
                $differentBookingSurges = new BookingSurgeParameter;
                $differentBookingSurges->booking_id                 = $booking->id;
                $differentBookingSurges->usage_surge_percent        = $response['usageSurgePercentage'];
                $differentBookingSurges->usage_surge_amount         = $response['usageSurgeAmount'];
                $differentBookingSurges->day_surge_percent          = $response['daySurgePercentage'];
                $differentBookingSurges->day_surge_amount           = $response['daySurgeAmount'];
                $differentBookingSurges->date_surge_percent         = $response['dateSurgePercentage'];
                $differentBookingSurges->date_surge_amount          = $response['dateSurgeAmount'];
                $differentBookingSurges->area_surge_percent         = $response['areaSurgePercentage'];
                $differentBookingSurges->area_surge_amount          = $response['areaSurgeAmount'];
                $differentBookingSurges->callcenter_surge_percent   = $response['callCenterSurgePercentage'];
                $differentBookingSurges->callcenter_surge_amount    = $response['callCenterSurgeAmount'];
                $differentBookingSurges->extra_surge_percent        = $response['extraSurgePercentage'];
                $differentBookingSurges->extra_surge_amount         = $response['extraSurgeAmount'];
                $differentBookingSurges->created_at                 = date("Y-m-d H:i:s");
                $differentBookingSurges->updated_at                 = date("Y-m-d H:i:s");
                $differentBookingSurges->save();
            }
        }
       
        $bookingDriverDetails                       = new BookingDriverDetails;
        $bookingDriverDetails->booking_id           = $booking->id;
        $bookingDriverDetails->estimate_upper_trip_charge  = $tripCharge;
        $bookingDriverDetails->trip_charge          = $tripCharge;
        $bookingDriverDetails->lower_trip_charge    = $lowerTripCharge;
        $bookingDriverDetails->loading_charge       = $loadingCharge;
        $bookingDriverDetails->unloading_charge     = $unloadingCharge;
        $bookingDriverDetails->drop_points_charge   = $dropPointCharge;
        $bookingDriverDetails->tip_charge           = $tipCharge;
        $bookingDriverDetails->estimate_driver_surge_charge  = $mgBonus;
        $bookingDriverDetails->estimate_driver_surge_percentage  = number_format($mgBonusPercentage, 1, '.', '');
        $bookingDriverDetails->save();
        
        
        $commonFunction = new CommonFunctionController;
        $allotedTo= $commonFunction->addEmployeeAllotment($booking->id,'booked');
        Booking::where('id', $booking->id)->update(['alloted_to_id' =>$allotedTo]);
        if(isset($data['book_later']))
        {
            $notNeedToSearch = $data['book_later'];
        }
        else
        {
            $notNeedToSearch = false;
        }
        if($notNeedToSearch == false)
        {
            if(isset($data['allot_to_fav_driver']) && $data['allot_to_fav_driver'] == true)
            {
                $responseBoolean = $this->_checkFavDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if(isset($checkBookingIsAlloted->driver_id))
                    {
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            $responseArray['success'] = true;
                            $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                            $responseArray['data']    = array('responseCode' => 3 , 'booking_id' => $booking->id );
                        }
                        else
                        {
                            $responseArray['success'] = true;
                            $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                            $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );
                        }
                    }
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );

                }
                $data['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($data);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
            else
            {
                $responseBoolean = $this->_checkDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted != "")
                        {
                            if($checkBookingIsAlloted->driver_id != 0)
                            {
                                break;
                            }    
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                        $responseArray['data']    = array('responseCode' => 1 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                    }
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                }
                $data['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($data);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
        }
        $data['booking_id'] = $booking->id;
        $bookingDataArray = $this->getCustomerSingleBooking($data);
        $response['success'] = true;
        $response['message'] = "Your booking has been saved with us. We will notify you as soon as a driver is alloted on this booking.";
        $response['data']    = array('responseCode' => 4 , 'booking_id' => $booking->id );
        $response['trip_data'] = $bookingDataArray;
        return $response;
    }
    
    # Function : This function used for Internal system to check fav driver is available or not 
    # Request : Booking id
    # Response : Success messages with data 
    # Autor : Vinod Kumar

    public function _checkDriverAvailable($bookingId)
    {
        if(isset($bookingId))
        {
            $bookingDetails = Booking::where('driver_id', '0') 
                            ->where('allotment_type',0)
                            ->where('id',$bookingId)
                            ->first();

            $vehicleCategoryId = $bookingDetails->vehicle_id;
            if($bookingDetails->covered_required == 1)
            {
                $coveredStatus = 'yes';
            } 
            else 
            {
                $coveredStatus = 'no';
            }
            
            if($bookingDetails->loading_required == 1 || $bookingDetails->unloading_required == 1)
            {
                $loadongUnloadingStatus = 'yes';
            } 
            else 
            {
                $loadongUnloadingStatus = 'no';
            }

            $avilableDrivers = DriverRegular::where('status','free')->get();
            $avilableDriversDeatilsArray = array();
            if(count($avilableDrivers) == 0)
            {
                return false;
            }
            else
            {
                $avilableDriversIdsArray = array();
                foreach ($avilableDrivers as $key => $value) 
                {
                    $avilableDriversDeatilsArray[$value->driver_id] = $value;
                    array_push($avilableDriversIdsArray, $value->driver_id);
                }

                $driverDetails = Driver::where('vehicle_category_id', $bookingDetails->vehicle_id)
                             ->where('driver_status','active')
                             ->whereIn('id',$avilableDriversIdsArray)
                             ->get();

                $primeDriverArray = array();
                if(count($driverDetails)) 
                {
                    $driverLoginDetialsArray = array();
                    foreach ($driverDetails as $key => $value) 
                    {
                        array_push($driverLoginDetialsArray, $value->id);
                        $primeDriverArray[$value->id]  = $value;
                    }
                } 
                else 
                {
                    return false;
                }

                $driverLoginDetials = '';
                $take = count($driverLoginDetialsArray);
                foreach ($driverLoginDetialsArray as $key => $value) 
                {
                    $getDetails = DriverDetials::where('driver_id',$value)->orderBy('created_at','DESC')->first();
                    if($getDetails != '')
                    {
                        if ($bookingDetails->loading_required == 0 && $bookingDetails->unloading_required == 0 && $getDetails->covered_status == $coveredStatus) 
                        {
                            $driverLoginDetials[] = $getDetails;
                        }
                        else if ($loadongUnloadingStatus == 'yes') 
                        {
                            if ($getDetails->loading_unloading_status == $loadongUnloadingStatus && $getDetails->covered_status == $coveredStatus) 
                            {
                                $driverLoginDetials[] = $getDetails;
                            }
                        }
                        else
                        {
                            if($getDetails->loading_unloading_status == $loadongUnloadingStatus && $getDetails->covered_status == $coveredStatus)
                            {
                                $driverLoginDetials[] = $getDetails;
                            }
                        }
                    }
                }
                if($driverLoginDetials != '')
                {
                    $driverMatchArray = array();
                    foreach ($driverLoginDetials as $key => $value) 
                    {
                        if (!in_array($value->driver_id, $driverMatchArray) && $value->covered_status == $coveredStatus)
                        {
                            array_push($driverMatchArray, $value->driver_id);
                        }
                    }                      
                } 
                else 
                {
                    if(empty($driverLoginDetials))
                    {
                        return false;
                    }
                }
                $allowMaxAttempts = 3;
                $allowMaxRadiant = 7000;
                $allowMinRoute = 2500;
                $allowMaxRoute = 5000;
                $sleepTime = 0;
                $primeDriverSleepTime = 0;
                $getSetting = MaalgaadiSettings::where('city_id',$bookingDetails->city_id)->first();
                if($getSetting != '')
                {
                    $allowMaxAttempts = (int)$getSetting->allow_max_attempts;
                    $allowMaxRadiant = (int)$getSetting->allow_max_radiant;
                    $allowMinRoute = (int)$getSetting->allow_min_route;
                    $allowMaxRoute = (int)$getSetting->allow_max_route;
                    $sleepTime = (int)$getSetting->time_interval;
                    $primeDriverSleepTime = (int)$getSetting->allow_time_interval_for_prime_drivers;
                }

                // Get Booking pickup and drop point
                $favoriteLocation = FavoriteLocation::where('booking_id', $bookingId)->first();
                $lat = $favoriteLocation->pickup_lat;
                $lng = $favoriteLocation->pickup_lng;
                $nearestDriversArray = array();  
                // Get driver last booking update time.                          
                $getDriverLastUpdate = DriverUpdate::whereIn('driver_id',$driverMatchArray)->get();
                $getDriverLastUpdateArray = array();
                if(!empty($getDriverLastUpdate))
                {
                    foreach ($getDriverLastUpdate as $key => $value) 
                    {
                        $getDriverLastUpdateArray[$value->driver_id] = $value;
                    }
                }
                $origins = '';
                $filterDriverArray = array();
                
                // Merge Origin addresses in single request with one destination point.
                foreach ($driverMatchArray as $key => $value) 
                {
                    $driverLat = $avilableDriversDeatilsArray[$value]['lat'];
                    $driverLng = $avilableDriversDeatilsArray[$value]['lng'];
                    $auto = new AutoAllotBookingController;
                    $getRadiant = $auto->getRadiantdistance($lat, $lng, $driverLat, $driverLng);
                    if($getRadiant < $allowMaxRadiant){
                        array_push($filterDriverArray, $value);
                        if(empty($origins)) 
                        {
                            $origins .= $driverLat.','. $driverLng;    
                        } 
                        else 
                        {
                            $origins .= "|".$driverLat.','. $driverLng;    
                        }
                    }
                }
                $destination   = $lat.','.$lng;
                $url           = "https://maps.googleapis.com/maps/api/distancematrix/json?".Config::get('constants.keyValue')."=".Config::get('constants.googleserverkey')."&origins=".$origins."&destinations=".$destination."";
                $json          = @file_get_contents($url); 
                $data          = json_decode($json);
                $firstPriorityDriveers = array(); 
                $secondPriorityDriveers = array(); 
                $dataSetForTemp = array();

                $vehicleCategoryDetail = VehicleCategory::find($vehicleCategoryId);  
                $maxDtcBufferPercentage = $vehicleCategoryDetail->max_dtc_buffer_percentage;
                // Set Priority for alloting booking with nearest distance and last updated booking time
                foreach ($filterDriverArray as $key => $value) 
                {
                    $distanceMeter = $data->rows[$key]->elements[0]->distance->value;
                    $actualDtcKm   = ($distanceMeter/1000);
                    $dtcKm         = $actualDtcKm + (($actualDtcKm * $maxDtcBufferPercentage)/100);
                    $time          = $data->rows[$key]->elements[0]->duration->value;
                    $time          = $time/60;
                    $distanceMeter = $dtcKm * 1000;

                    $dataSetForTemp[$key] = [
                                            'booking_id'  => $bookingId,
                                            'driver_id' => $value,
                                            'distance' => $distanceMeter,
                                            ]; 

                    if($distanceMeter < $allowMinRoute)
                    {
                        $firstPriorityDriveers[$key]['driver_id'] = $value;
                        $firstPriorityDriveers[$key]['awayFrom'] = $distanceMeter;
                        $firstPriorityDriveers[$key]['time'] = $time;
                        $firstPriorityDriveers[$key]['is_prime']  = $primeDriverArray[$value]['is_prime'];
                        if(!empty($getDriverLastUpdateArray[$value]['update_at']))
                        {
                            $firstPriorityDriveers[$key]['last_updated'] = strtotime($getDriverLastUpdateArray[$value]['update_at']);
                        } 
                        else
                        {
                            $firstPriorityDriveers[$key]['last_updated'] = 0;
                        }
                    } 
                    if($distanceMeter > $allowMinRoute && $distanceMeter < $allowMaxRoute) 
                    {
                        $secondPriorityDriveers[$key]['driver_id'] = $value;
                        $secondPriorityDriveers[$key]['awayFrom'] = $distanceMeter;
                        $secondPriorityDriveers[$key]['time'] = $time;
                        $secondPriorityDriveers[$key]['is_prime']  = $primeDriverArray[$value]['is_prime'];
                        if(!empty($getDriverLastUpdateArray[$value]['update_at']))
                        {
                            $secondPriorityDriveers[$key]['last_updated'] = strtotime($getDriverLastUpdateArray[$value]['update_at']);
                        } 
                        else 
                        {
                            $secondPriorityDriveers[$key]['last_updated'] = 0;
                        }
                    }
                }
                
                if(!empty($firstPriorityDriveers))
                {
                    $this->array_sort_by_column($firstPriorityDriveers, 'last_updated');
                    $this->array_sort_by_column($firstPriorityDriveers, 'is_prime',SORT_DESC);
                }
                if(!empty($secondPriorityDriveers))
                {
                    $this->array_sort_by_column($secondPriorityDriveers, 'last_updated');
                    $this->array_sort_by_column($secondPriorityDriveers, 'is_prime',SORT_DESC);
                }
                //  Send booking ID and driver ID to push API for driver notifcation to accept the booking
                if(!empty($firstPriorityDriveers) || !empty($secondPriorityDriveers))
                {
                    if(!empty($firstPriorityDriveers[0]))
                    {
                        foreach($dataSetForTemp as $key=>$val)
                        {
                           if($val['driver_id'] == $firstPriorityDriveers[0]['driver_id'])
                           {
                              unset($dataSetForTemp[$key]);
                           }
                        }
                        $dataSetForTemp = array_values($dataSetForTemp);

                        if(!empty($dataSetForTemp))
                        {
                            AutoAllotedTemp::insert($dataSetForTemp);    
                        }
                        
                        $isNextPrime = 0;
                        $isWait = 0;
                        // $url = '/api/notification?booking_id='.$bookingId.'&driver_id='.$firstPriorityDriveers[0]['driver_id'];
                        foreach ($firstPriorityDriveers as $key => $value) 
                        {
                            $value['driver_id'];
                            $bookingDetails['id'];
                            $checkAlloted = $this->checkBookingAlloted($bookingDetails['id']);
                            if($checkAlloted)
                            {
                                $baseUrl = url('/');
                                $url= $baseUrl."/api/notification?booking_id=".$bookingId."&driver_id=".$value['driver_id']."&auto_flag=1&dtcKm=".$value['awayFrom']."&time=".$value['time']; 
                                $this->_backgroundAllotment($url);
                                // sleep($sleepTime);
                                if(isset($firstPriorityDriveers[$key+1]))
                                {
                                    if($firstPriorityDriveers[$key+1]['is_prime'] == $isNextPrime)
                                    {
                                        $isWait = 1;
                                    }
                                }
                                
                                if($value['is_prime'] == 1 && $isWait == 1)
                                {
                                    sleep($primeDriverSleepTime);
                                }
                            } 
                            else 
                            {
                                $response['success'] = true;
                                $response['message'] = "Your booking has been saved with us. We will notify you as soon as a driver is allotted.";
                                $response['data']    = array('responseCode' => 1 , 'booking_id' => $bookingId );
                                return $response;
                            }
                        }
                        sleep($primeDriverSleepTime);
                        $checkAlloted = $this->checkBookingAlloted($bookingDetails['id']);
                        if($checkAlloted)
                        {
                            foreach ($secondPriorityDriveers as $key => $value) 
                            {
                                $checkAlloted = $this->checkBookingAlloted($bookingDetails['id']);
                                if($checkAlloted)
                                {
                                    $baseUrl = url('/');
                                    $url= $baseUrl."/api/notification?booking_id=".$bookingId."&driver_id=".$value['driver_id']."&auto_flag=1&dtcKm=".$value['awayFrom']."&time=".$value['time'];
                                    $this->_backgroundAllotment($url);
                                    // sleep($sleepTime);
                                    if($secondPriorityDriveers[$key+1]['is_prime'] == $isNextPrime)
                                    {
                                        $isWait = 1;
                                    }
                                    if($value['is_prime'] == 1 && $isWait == 1)
                                    {
                                        sleep($primeDriverSleepTime);
                                    }
                                } 
                                else 
                                {
                                    return true;
                                }
                            }
                        } 
                        else 
                        {
                            return true;
                        }
                    } 
                    else 
                    {
                        $isNextPrime = 0;
                        $isWait = 0;
                        foreach($dataSetForTemp as $key=>$val)
                        {
                           if($val['driver_id'] == $secondPriorityDriveers[0]['driver_id'])
                           {
                              unset($dataSetForTemp[$key]);
                           }
                        }
                        $dataSetForTemp = array_values($dataSetForTemp);
                        if(!empty($dataSetForTemp))
                        {
                             AutoAllotedTemp::insert($dataSetForTemp);    
                        }
                        
                        foreach ($secondPriorityDriveers as $key => $value) 
                        {
                            $checkAlloted = $this->checkBookingAlloted($bookingDetails['id']);
                            if($checkAlloted)
                            {
                                $baseUrl = url('/');
                                $url= $baseUrl."/api/notification?booking_id=".$bookingId."&driver_id=".$value['driver_id']."&auto_flag=1&dtcKm=".$value['awayFrom']."&time=".$value['time'];
                                $this->_backgroundAllotment($url);
                                // sleep($sleepTime);
                                if($secondPriorityDriveers[$key+1]['is_prime'] == $isNextPrime)
                                {
                                    $isWait = 1;
                                }
                                if($value['is_prime'] == 1 && $isWait == 1)
                                {
                                    sleep($primeDriverSleepTime);
                                }
                            } 
                        }
                    }
                    return true;
                } 
                else 
                {
                    return false;

                }
            }
        }
    }

    # Function : This function used for Internal system to check fav driver is available or not 
    # Request : Booking id
    # Response : Success messages with data 
    # Autor : Vinod Kumar
    public function _checkFavDriverAvailable($bookingId)
    {
        if(isset($bookingId))
        {
            $bookingDetails = Booking::where('driver_id', '0') 
                            ->where('allotment_type',0)
                            ->where('id',$bookingId)
                            ->first();
            $vehicleCategoryId = $bookingDetails->vehicle_id;
            
            $favDrivers = FavouriteDriver::where('customer_id',$bookingDetails->customer_id)->where('status','Active')->where('delete_flag',0)->get();

            if(count($favDrivers) == 0)
            {
                return false;
            }

            $favDriverIdsArray = array();
            foreach ($favDrivers as $key => $value)
            {
                array_push($favDriverIdsArray, $value->driver_id);
            }

            $avilableDrivers = DriverRegular::where('status','free')->whereIn('driver_id',$favDriverIdsArray)->get();

            $avilableDriversDeatilsArray = array();
            if(count($avilableDrivers) == 0)
            {
                return false;
            }
            else
            {
                $avilableDriversIdsArray = array();
                foreach ($avilableDrivers as $key => $value) 
                {
                    $avilableDriversDeatilsArray[$value->driver_id] = $value;
                    array_push($avilableDriversIdsArray, $value->driver_id);
                }

                $driverDetails = Driver::where('vehicle_category_id', $bookingDetails->vehicle_id)
                             ->where('driver_status','active')
                             ->whereIn('id',$avilableDriversIdsArray)
                             ->get();

                if(count($driverDetails)) 
                {
                    $driverLoginDetialsArray = array();
                    foreach ($driverDetails as $key => $value) 
                    {
                        array_push($driverLoginDetialsArray, $value->id);
                    }
                } 
                else 
                {
                    return false;
                }

                $driverLoginDetials = '';
                $take = count($driverLoginDetialsArray);
                foreach ($driverLoginDetialsArray as $key => $value) 
                {
                    $getDetails = DriverDetials::where('driver_id',$value)->orderBy('created_at','DESC')->first();
                    if($getDetails != '')
                    {
                        $driverLoginDetials[] = $getDetails;
                    }
                }
                if($driverLoginDetials != '')
                {
                    $driverMatchArray = array();
                    foreach ($driverLoginDetials as $key => $value) 
                    {
                        if (!in_array($value->driver_id, $driverMatchArray))
                        {
                            array_push($driverMatchArray, $value->driver_id);
                        }
                    }                      
                } 
                else 
                {
                    if(empty($driverLoginDetials))
                    {
                        return false;
                    }
                }
                // Get Booking pickup and drop point
                $favoriteLocation = FavoriteLocation::where('booking_id', $bookingId)->first();
                $lat = $favoriteLocation->pickup_lat;
                $lng = $favoriteLocation->pickup_lng;
                $nearestDriversArray = array();  
                // Get driver last booking update time.                          
                $getDriverLastUpdate = DriverUpdate::whereIn('driver_id',$driverMatchArray)->get();
                $getDriverLastUpdateArray = array();
                if(!empty($getDriverLastUpdate))
                {
                    foreach ($getDriverLastUpdate as $key => $value) 
                    {
                        $getDriverLastUpdateArray[$value->driver_id] = $value;
                    }
                }
                $origins = '';
                $filterDriverArray = array();
                 
                // Merge Origin addresses in single request with one destination point.
                foreach ($driverMatchArray as $key => $value) 
                {
                    $driverLat = $avilableDriversDeatilsArray[$value]['lat'];
                    $driverLng = $avilableDriversDeatilsArray[$value]['lng'];
                    array_push($filterDriverArray, $value);
                    if(empty($origins)) 
                    {
                        $origins .= $driverLat.','. $driverLng;    
                    } 
                    else 
                    {
                        $origins .= "|".$driverLat.','. $driverLng;    
                    }
                }
                $destination   = $lat.','.$lng;
                $url           = "https://maps.googleapis.com/maps/api/distancematrix/json?".Config::get('constants.keyValue')."=".Config::get('constants.googleserverkey')."&origins=".$origins."&destinations=".$destination."";
                $json          = @file_get_contents($url); 
                $data          = json_decode($json);
                $firstPriorityDriveers = array(); 
                $secondPriorityDriveers = array(); 
                $dataSetForTemp = array();

                $vehicleCategoryDetail = VehicleCategory::find($vehicleCategoryId);  
                $maxDtcBufferPercentage = $vehicleCategoryDetail->max_dtc_buffer_percentage;
                // Set Priority for alloting booking with nearest distance and last updated booking time
                foreach ($filterDriverArray as $key => $value) 
                {
                    $distanceMeter = $data->rows[$key]->elements[0]->distance->value;
                    $actualDtcKm   = ($distanceMeter/1000);
                    $dtcKm         = $actualDtcKm + (($actualDtcKm * $maxDtcBufferPercentage)/100);
                    $distanceMeter = $dtcKm * 1000;
                    $time          = $data->rows[$key]->elements[0]->duration->value;
                    $time          = $time/60;

                    $dataSetForTemp[$key] = [
                                            'booking_id'  => $bookingId,
                                            'driver_id' => $value,
                                            'distance' => $distanceMeter,
                                            ]; 

                    
                    $firstPriorityDriveers[$key]['driver_id'] = $value;
                    $firstPriorityDriveers[$key]['awayFrom'] = $distanceMeter;
                    $firstPriorityDriveers[$key]['time'] = $time;
                    if(!empty($getDriverLastUpdateArray[$value]['update_at']))
                    {
                        $firstPriorityDriveers[$key]['last_updated'] = strtotime($getDriverLastUpdateArray[$value]['update_at']);
                    } 
                    else
                    {
                        $firstPriorityDriveers[$key]['last_updated'] = 0;
                    }
                }
                
                if(!empty($firstPriorityDriveers))
                {
                    $this->array_sort_by_column($firstPriorityDriveers, 'last_updated');
                }
                
                //  Send booking ID and driver ID to push API for driver notifcation to accept the booking
                if(!empty($firstPriorityDriveers))
                {
                    if(!empty($firstPriorityDriveers[0]))
                    {
                        foreach($dataSetForTemp as $key=>$val)
                        {
                           if($val['driver_id'] == $firstPriorityDriveers[0]['driver_id'])
                           {
                              unset($dataSetForTemp[$key]);
                           }
                        }
                        $dataSetForTemp = array_values($dataSetForTemp);

                        if(!empty($dataSetForTemp))
                        {
                            AutoAllotedTemp::insert($dataSetForTemp);    
                        }
                        
                        $url = '/api/notification?booking_id='.$bookingId.'&driver_id='.$firstPriorityDriveers[0]['driver_id'];
                        foreach ($firstPriorityDriveers as $key => $value) 
                        {
                            $value['driver_id'];
                            $bookingDetails['id'];
                            $checkAlloted = $this->checkBookingAlloted($bookingDetails['id']);
                            $baseUrl = url('/');
                            $url= $baseUrl."/api/notification?booking_id=".$bookingId."&driver_id=".$value['driver_id']."&auto_flag=1&dtcKm=".$value['awayFrom']."&time=".$value['time'];
                            $this->_backgroundAllotment($url);
                        }
                        return true;
                    } 
                    return true;
                } 
                else 
                {
                    return false;
                }
            }
        }
        
    }

    public function checkBookingAlloted($bookingId)
    {
        $getBooking = Booking::where('id',$bookingId)->where('driver_id','=','0')->first();
        if(count($getBooking))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    # Function : This function used for Internal system to send booking to driver 
    # Request : Complete url of allotment 
    # Response : Balance 
    # Autor : Vinod Kumar
    
    function _backgroundAllotment($url){ 
        ignore_user_abort(true); 
        ini_set('max_execution_time', 0);       
        set_time_limit(0);       
        $parts    = parse_url($url);      
        $fp     = fsockopen($parts['host'],    isset($parts['port'])?$parts['port']:80, $errno, $errstr, 30);      
        if(!$fp) 
        { 
            return false; 
        }
        else
        { 
            if(!isset($parts['query']))
            { 
                $query = ''; 
            }
            else
            { 
                $query = $parts['query']; 
            } 
            $out = "POST ".$parts['path']." HTTP/1.1\r\n"; 
            $out.= "Host: ".$parts['host']."\r\n"; 
            $out.= "Content-Type: application/x-www-form-urlencoded\r\n"; 
            $out.= "Content-Length: ".strlen($query)."\r\n"; 
            $out.= "Connection: Close\r\n\r\n"; 
            $out.= $query;             
            fwrite($fp, $out); 
            fclose($fp); 
            return true; 
        } 
    }

    # Function : This function used for get customer Balance by customer ID
    # Request : Customer Id 
    # Response : Balance 
    # Autor : Rahul Patidar
    # Modify By Vinod Kumar

    public function customerBalance($id)
    {
         $data=CustomerLedger::where('customer_id',$id)->orderBy('id', 'desc')->take(1)->get();
         if(isset($data[0]))
         { 
           return $data[0]->final_balance;
         } 
         else
         {
           return '0';
         }
    }

    # Function : Add Notes on Running trips
    # Request : Booking Id & Note
    # Response : Json message with fetch records
    # Autor : Brijendra 
    public function addNotesOnRunningTrip(Request $request)
    {
        $data  = $request->all();
        $array = array();

        if (isset($data['booking_id'])) 
        {
            $bookingId = $data['booking_id'];
            $bookingEstimateDetails = BookingCustomerDetails::where('booking_id', $bookingId)->first();
            if (!empty($bookingEstimateDetails)) 
            {
                if(isset($data['customer_notes']))
                {
                    $customerNotes = $data['customer_notes'];

                    if ($customerNotes != '') 
                    {
                        $bookingEstimateDetails->reference_text = $customerNotes;
                        $bookingEstimateDetails->save();
                        
                        $response['success'] = true;
                        $response['message'] = "Note has been saved.";
                        $response['data']    = (object) array();
                        return $response;
                    }
                    else
                    {
                        $response['success'] = false;
                        $response['message'] = "Note Already Saved";
                        $response['data']    = array('note' => $bookingEstimateDetails->reference_text);
                        return $response;
                    }
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Notes parameter is required..";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Booking id not available.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Vehicle category Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function is used for Get customer Setting 
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    # Modified by: Rahul Patidar
    public function getCustomerSetting(Request $request)
    {
        $data = $request->all();
        $customerId = isset($data['customer_id']) ? $data['customer_id'] : '';
        if($customerId)
        {
            $customerDetails = Customer::select('goods_id')->find($customerId);
            $customerSetting = CustomerSetting::where('customer_id', $customerId)->first();
            if($customerSetting == '')
            {
                $customerSetting = array();
                $customerSetting['customer_id'] = $customerId;
                $customerSetting['msg_on_reaching_pickup_point'] = '1';
                $customerSetting['msg_on_reaching_destination'] = '1';
                $customerSetting['msg_on_billing'] = '1';
                $customerSetting['msg_on_vehicle_allotment'] = '1';
                $customerSetting['all_sms'] = '1';
                $customerSetting['msg_on_invoice'] = '1';
                $customerSetting['msg_on_pod'] = '1';
                $customerSetting['noti_on_vehicle_allotment'] = '1';
                $customerSetting['noti_on_reaching_pickup_point'] = '1';
                $customerSetting['noti_on_reaching_destination'] = '1';
                $customerSetting['noti_on_billing'] = '1';
                $customerSetting['noti_on_invoice'] = '1';
                $customerSetting['noti_on_pod'] = '1';
                $customerSetting['all_notification'] = '1';
                $customerSetting['invoice_mail'] = '1';
                $customerSetting['pod_mail'] = '1';

                $customerSetting['reference_text,'] = '1';
                $customerSetting['trip_id'] = '1';
                $customerSetting['vehicle_reg_num'] = '1';
                $customerSetting['schedule_date'] = '1';
                $customerSetting['oth_trip_code_allow'] = '1';
                $customerSetting['oth_reference_text'] = '0';
            }
            else
            {
                $customerSetting = $customerSetting->toArray();
            }
            if($customerDetails->trip_code == '')
            {
                $customerSetting['oth_trip_code_allow'] = '0';
            }
            $customerStttingsDetails = array();
            foreach ($customerSetting as $key => $value) 
            {
                
                if($key == 'customer_id')
                {
                    $customerStttingsDetails['customer_id'] = $data['customer_id'];
                }
                else
                {
                    if($value == '1' || $value == 1)
                    {
                        $customerStttingsDetails[$key] = true;
                    }
                    else
                    {
                        $customerStttingsDetails[$key] = false;
                    }
                }
                
            }

            if($customerStttingsDetails)
            {   
                $customerStttingsDetails['type_of_good'] = 0;
                if(isset($customerDetails->goods_id))
                {
                    $customerStttingsDetails['type_of_good'] = $customerDetails->goods_id;
                }
            }

            $response['success'] = true;
            $response['message'] = "You settings have been updated.";
            $response['data']    = $customerStttingsDetails;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id not found.";
            $response['data']    = (object) array();
            return $response;
        }
    } 

    # Function : This function is used for Add customer Setting 
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function updateCustomerSetting(Request $request)
    {
        //$data = $request->all();
        $rawData = file_get_contents("php://input");
        $data = (array) json_decode($rawData);
        

        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
            $customerSetting = CustomerSetting::where('customer_id',$customerId)->first();

            if(isset($data['msg_on_reaching_pickup_point']) && $data['msg_on_reaching_pickup_point'] == true)
            {
                $customerSetting->msg_on_reaching_pickup_point = '1';
            }
            else
            {
                $customerSetting->msg_on_reaching_pickup_point = '0';
            }
            if(isset($data['msg_on_reaching_destination']) && $data['msg_on_reaching_destination'] == true)
            {
                $customerSetting->msg_on_reaching_destination = '1';
            }
            else
            {
                $customerSetting->msg_on_reaching_destination = '0';
            }
            if(isset($data['msg_on_billing']) && $data['msg_on_billing'] == true)
            {
                $customerSetting->msg_on_billing = '1';
            }
            else
            {
                $customerSetting->msg_on_billing = '0';
            }
            if(isset($data['msg_on_vehicle_allotment']) && $data['msg_on_vehicle_allotment'] == true)
            {
                $customerSetting->msg_on_vehicle_allotment = '1';
            }
            else
            {
                $customerSetting->msg_on_vehicle_allotment = '0';
            }
            if(isset($data['msg_on_invoice']) && $data['msg_on_invoice'] == true)
            {
                $customerSetting->msg_on_invoice = '1';
            }
            else
            {
                $customerSetting->msg_on_invoice = '0';
            }
            if(isset($data['msg_on_pod']) && $data['msg_on_pod'] == true)
            {
                $customerSetting->msg_on_pod = '1';
            }
            else
            {
                $customerSetting->msg_on_pod = '0';
            }

            if(isset($data['all_sms']) && $data['all_sms'] == true)
            {
                $customerSetting->all_sms = '1';
            }
            else
            {
                $customerSetting->all_sms = '0';
            }

            if(isset($data['noti_on_vehicle_allotment']) && $data['noti_on_vehicle_allotment'] == true)
            {
                $customerSetting->noti_on_vehicle_allotment = '1';
            }
            else
            {
                $customerSetting->noti_on_vehicle_allotment = '0';
            }
            if(isset($data['noti_on_reaching_pickup_point']) && $data['noti_on_reaching_pickup_point'] == true)
            {
                $customerSetting->noti_on_reaching_pickup_point = '1';
            }
            else
            {
                $customerSetting->noti_on_reaching_pickup_point = '0';
            }
            if(isset($data['noti_on_reaching_destination']) && $data['noti_on_reaching_destination'] == true)
            {
                $customerSetting->noti_on_reaching_destination = '1';
            }
            else
            {
                $customerSetting->noti_on_reaching_destination = '0';
            }
            if(isset($data['noti_on_billing']) && $data['noti_on_billing'] == true)
            {
                $customerSetting->noti_on_billing = '1';
            }
            else
            {
                $customerSetting->noti_on_billing = '0';
            }
            if(isset($data['noti_on_invoice']) && $data['noti_on_invoice'] == true)
            {
                $customerSetting->noti_on_invoice = '1';
            }
            else
            {
                $customerSetting->noti_on_invoice = '0';
            }

            if(isset($data['noti_on_pod']) && $data['noti_on_pod'] == true)
            {
                $customerSetting->noti_on_pod = '1';
            }
            else
            {
                $customerSetting->noti_on_pod = '0';
            }
            if(isset($data['all_notification']) && $data['all_notification'] == true)
            {
                $customerSetting->all_notification = '1';
            }
            else
            {
                $customerSetting->all_notification = '0';
            }

            if(isset($data['invoice_mail']) && $data['invoice_mail'] == true)
            {
                $customerSetting->invoice_mail = '1';
            }
            else
            {
                $customerSetting->invoice_mail = '0';
            }
            if(isset($data['pod_mail']) && $data['pod_mail'] == true )
            {
                $customerSetting->pod_mail = '1';
            }
            else
            {
                $customerSetting->pod_mail = '0';
            }
            if(isset($data['invoice']) && $data['invoice'] == true )
            {
                $customerSetting->invoice = '1';
            }
            else
            {
                $customerSetting->invoice = '0';
            }

            if(isset($data['trip_id']) && $data['trip_id'] == true )
            {
                $customerSetting->trip_id = '1';
            }
            else
            {
                $customerSetting->trip_id = '0';
            }
            if(isset($data['reference_text']) && $data['reference_text'] == true)
            {
                $customerSetting->reference_text = '1';
            }
            else
            {
                $customerSetting->reference_text = '0';
            }
            if(isset($data['vehicle_reg_num']) && $data['vehicle_reg_num'] == true)
            {
                $customerSetting->vehicle_reg_num = '1';
            }
            else
            {
                $customerSetting->vehicle_reg_num = '0';
            }

            if(isset($data['schedule_date']) && $data['schedule_date'] == true)
            {
                $customerSetting->schedule_date = '1';
            }
            else
            {
                $customerSetting->schedule_date = '0';
            }
            if(isset($data['oth_trip_code_allow']) && $data['oth_trip_code_allow'] == true)
            {
                $customerSetting->oth_trip_code_allow = '1';
            }
            else
            {
                $customerSetting->oth_trip_code_allow = '0';
            }

            if(isset($data['oth_reference_text']) && $data['oth_reference_text'] == true)
            {
                $customerSetting->oth_reference_text = '1';
            }
            else
            {
                $customerSetting->oth_reference_text = '0';
            }
            $customerSetting->save();

            if(isset($data['type_of_good']))
            {
                $goodsDate = array();
                $goodsData['goods_id'] = $data['type_of_good'];
                $customerSetting->goods_id = $data['type_of_good'];
                Customer::where('id', $customerId)->update($goodsData);
            }
            $customerSetting = CustomerSetting::where('customer_id',$customerId)->first()->toArray();

             $customerStttingsDetails = array();
             foreach ($customerSetting as $key => $value) 
             {
                
                if($key == 'customer_id')
                {
                    $customerStttingsDetails[$key] = true;
                    $customerStttingsDetails['customer_id'] = $data['customer_id'];
                }
                else
                {
                    $customerStttingsDetails[$key] = false;
                    if($value == '1' || $value == 1)
                    {
                        $customerStttingsDetails[$key] = true;
                    }
                    else
                    {
                        $customerStttingsDetails[$key] = false;
                    }
                }
            }
            $response['success'] = true;
            $response['message'] = "You settings have been updated.";
            $response['data']    = $customerStttingsDetails;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id not found.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function is used for track driver for running booking
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function getCurrentDriverPosition(Request $request)
    {
        $data = $request->all();
        if(isset($data['booking_id']))
        {
            $bookingId      = $data['booking_id'];
            $bookingDetails = Booking::find($bookingId);
            $driverPoistion = DriverRegular::select('driver_id', 'lat', 'lng', 'status')->where('driver_id', $bookingDetails->driver_id)->first();
            if($driverPoistion != "")
            {
                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = $driverPoistion;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "No record found..";
                $response['data']    = (object) array();
                return $response; 
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        
    }

    # Function : This function is used for add Customer Default setting 
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function customerCredit($customerId)
    {
        $customerCredit = CreditLimit::where('customer_id', $customerId)->where('approved_by', '!=', '0')->first();      

        if($customerCredit != "")
        {
            return $customerCredit->credit_limit;
        }
        else
        {
            return '0';
        }
    }

    # Function : This function is used for add Customer Default setting 
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function customerSettingOneTime()
    {
        $customerDetails = Customer::all();
        foreach ($customerDetails as $key => $value) {
            $checkCustomer = CustomerSetting::where('customer_id', $value->id)->first();
            
            if($checkCustomer == '')
            {
                $customerSetting = new CustomerSetting;
                $customerSetting->customer_id = $value->id;
                $customerSetting->msg_on_reaching_pickup_point = '1';   
                $customerSetting->msg_on_reaching_destination = '1';
                $customerSetting->msg_on_billing = '1';
                $customerSetting->msg_on_vehicle_allotment = '1';
                $customerSetting->all_sms = '1';
                $customerSetting->msg_on_invoice = '1';
                $customerSetting->msg_on_pod = '1';
                $customerSetting->noti_on_vehicle_allotment = '1';
                $customerSetting->noti_on_reaching_pickup_point = '1';
                $customerSetting->noti_on_reaching_destination = '1';
                $customerSetting->noti_on_billing = '1';
                $customerSetting->noti_on_invoice = '1';
                $customerSetting->noti_on_pod = '1';
                $customerSetting->all_notification = '1';
                $customerSetting->invoice_mail = '1';
                $customerSetting->noti_on_pod = '1';
                $customerSetting->all_notification = '1';
                $customerSetting->invoice_mail = '1';
                $customerSetting->pod_mail = '1';
                $customerSetting->invoice = '1';
                $customerSetting->trip_id = '1';
                $customerSetting->reference_text = '1';
                $customerSetting->trip_id = '1';
                $customerSetting->vehicle_reg_num = '1';
                $customerSetting->schedule_date = '1';
                $customerSetting->oth_trip_code_allow = '1';
                $customerSetting->oth_reference_text = '0';
                $customerSetting->save();

            }
        }
    }

    # Function : This function is used for get Re book data according to booking Id
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function reBook(Request $request)
    {
        $convertText = new TranslateClient();
        $convertText->setSource('hi');
        $convertText->setTarget('en');
        $data = $request->all();
        $response = array();
        $result = array();
        if(!isset($data['booking_id']))
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['booking_id']) && $data['booking_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingId = $data['booking_id'];
        $bookingDetails = Booking::find($bookingId);

        if($bookingDetails == "")
        {   
            $response['success'] = false;
            $response['message'] = "Booking id not available..";
            $response['data']    = (object) array();
            return $response;
        }
        if($bookingDetails->favourite_driver_required == 1)
        {
            $result['allot_to_fav_driver'] = true;
        }
        else
        {
            $result['allot_to_fav_driver'] = false;
        }
        $bookingCustomerDetails = BookingCustomerDetails::where('booking_id',$bookingId)->first();
        $result['tip'] = $bookingCustomerDetails->tip_charge;
        $result['booking_event_type'] = $bookingDetails->booking_event_type;
        $result['booking_id'] = $bookingDetails->id;
        $result['booking_time'] = $bookingDetails->requirement_time;
        $result['customer_id'] = $bookingDetails->customer_id;
        $result['goods_id'] = $bookingDetails->goods_id;
        $result['random_code'] = $bookingDetails->random_code;
        $result['selected_vehicle_category'] = $bookingDetails->vehicle_id;
        $getVehicle = VehicleCategory::find($bookingDetails->vehicle_id);
        $result['selected_vehicle_category_name'] = $getVehicle->vehicle_name;
        
        $result['number_of_drop_points'] = $bookingDetails->drop_points;
        $result['minimum_time'] = $bookingDetails->approximately_hours;
        $result['minimum_distance'] = $bookingDetails->upper_trip_distance;
        
        if($bookingDetails->customer_pricing_id == 1)
        {
            $result['booking_type'] = 'normal';
        }
        else if($bookingDetails->customer_pricing_id == 2)
        {
            $result['booking_type'] = 'fixed';
        }
        else
        {
            $result['booking_type'] = 'hourly';
        }
        
        if($bookingDetails->e_pod_required == 1)
        {
            $result['electronic_pod'] = true;
        }
        else
        {
            $result['electronic_pod'] = false;
        }
        if($bookingDetails->phy_pod_required == 1)
        {
            $result['physical_pod'] = true;
        }
        else
        {
            $result['physical_pod'] = false;
        }
        if($bookingDetails->payment_option == 'pre')
        {
            $result['payment_at_pickup'] = true;
        }
        else
        {
            $result['payment_at_pickup'] = false;
        }
        if($bookingDetails->loading_required == 1)
        {
            $result['loading'] = true;
        }
        else
        {
            $result['loading'] = false;
        }
        if($bookingDetails->unloading_required == 1)
        {
            $result['unloading'] = true;
        }
        else
        {
            $result['unloading'] = false;
        }
        if($bookingDetails->covered_required == 1)
        {
            $result['covered'] = true;
        }
        else
        {
            $result['covered'] = false;
        }

        $good = GoodsType::find($bookingDetails->goods_id);
        if($good != '')
        {
            if($good->goods_name == 'Others')
            {
                $result['goods_type'] = $bookingDetails->other_goods_text;
            }
            else
            {
                $result['goods_type'] = $good->goods_name;
            }
        }
        
        $wayPointsArray = array();
        $location = FavoriteLocation::where('booking_id',$bookingId)->first();
        $count = 0;
        if($location != '')
        {
            if($location->pickup_landmark != '')
            {
                $result['mobile_number'] = $location->pickup_number;
                if($location->is_favourite_pickup == 1)
                {
                    $wayPointsArray[$count]['is_favorite'] = true;
                }
                else
                {
                    $wayPointsArray[$count]['is_favorite'] = false;
                }
                
                $wayPointsArray[$count]['is_filled'] = true;
                $wayPointsArray[$count]['is_footer'] = false;
                $wayPointsArray[$count]['is_pickup'] = true;
                $wayPointsArray[$count]['landmark'] = $location->pickup_landmark;
                $wayPointsArray[$count]['latitude'] = $location->pickup_lat;
                $wayPointsArray[$count]['longitude'] = $location->pickup_lng;
                $count = $count + 1;
            }
            
            if($location->drop_landmark != '')
            {
                if($location->is_favourite_drop == 1)
                {
                    $wayPointsArray[$count]['is_favorite'] = true;
                }
                else
                {
                    $wayPointsArray[$count]['is_favorite'] = false;
                }
                $wayPointsArray[$count]['is_filled'] = true;
                $wayPointsArray[$count]['is_footer'] = false;
                $wayPointsArray[$count]['is_pickup'] = false;
                $wayPointsArray[$count]['landmark'] = $location->drop_landmark;
                $wayPointsArray[$count]['latitude'] = $location->drop_lat;
                $wayPointsArray[$count]['longitude'] = $location->drop_lng;
                $count = $count + 1;
            }
        }

        $wayPoints = CustomerDropPoints::where('booking_id',$bookingId)->get();
        
        if($wayPoints != '')
        {
            foreach ($wayPoints as $key => $value) 
            {
                if($value->is_favourite == 1)
                {
                    $wayPointsArray[$count]['is_favorite'] = true;
                }
                else
                {
                    $wayPointsArray[$count]['is_favorite'] = false;
                }
                $wayPointsArray[$count]['is_filled'] = true;
                $wayPointsArray[$count]['is_footer'] = false;
                $wayPointsArray[$count]['is_pickup'] = false;
                $wayPointsArray[$count]['landmark'] = $value->drop_landmark;
                $wayPointsArray[$count]['latitude'] = $value->drop_lat;
                $wayPointsArray[$count]['longitude'] = $value->drop_lng;
                $count++;
            }
        }
        
        $result['landmark_list'] = $wayPointsArray;
        $result['schedule_time_edit'] = true; 
        $result['pickup_address_edit'] = true; 
        $result['drop_address_edit'] = true; 
        $result['type_of_booking_edit'] = true;
        $result['loading_edit'] = true;
        $result['unloading_edit'] = true;
        $result['payment_method_edit'] = true;
        $result['pod_edit'] = true;
        $result['number_of_drop_point_edit'] = true;
        

        if($result != "")
        {   
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $result;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found..";
            $response['data']    = (object) array();
            return $response;
        }
    }


    # Function : This function is used for get Re book data according to booking Id
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    # Modify by : Brijendra

    public function getBookingDetails(Request $request)
    {
        $convertText = new TranslateClient();
        $convertText->setSource('hi');
        $convertText->setTarget('en');
        $data = $request->all();
        $response = array();
        $result = array();
        if(!isset($data['booking_id']))
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['booking_id']) && $data['booking_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingId = $data['booking_id'];
        $bookingDetails = Booking::find($bookingId);
        if(isset($data['booking_type']) && $data['booking_type'] == 'EDIT')
        {
            if($bookingDetails->driver_id == '-1')
            {
                $response['success'] = false;
                $response['message'] = "Booking has already been cancelled.";
                $response['data']    =  array('responseCode' => 1);
                return $response;
            }
        }
        if($bookingDetails == "")
        {   
            $response['success'] = false;
            $response['message'] = "Booking id not available.";
            $response['data']    = (object) array();
            return $response;
        }
        if($bookingDetails->favourite_driver_required == 1)
        {
            $result['allot_to_fav_driver'] = true;
        }
        else
        {
            $result['allot_to_fav_driver'] = false;
        }

        $bookingCustomerDetails = BookingCustomerDetails::where('booking_id',$bookingId)->first();
        $result['tip'] = $bookingCustomerDetails->tip_charge;
        $result['booking_event_type'] = $bookingDetails->booking_event_type;
        $result['booking_id'] = $bookingDetails->id;
        $result['booking_time'] = $bookingDetails->requirement_time;
        $result['customer_id'] = $bookingDetails->customer_id;
        $result['goods_id'] = $bookingDetails->goods_id;
        $result['random_code'] = $bookingDetails->random_code;
        $result['selected_vehicle_category'] = $bookingDetails->vehicle_id;
        $getVehicle = VehicleCategory::find($bookingDetails->vehicle_id);
        $result['selected_vehicle_category_name'] = $getVehicle->vehicle_name;
        
        $result['number_of_drop_points'] = $bookingDetails->drop_points;
        $result['minimum_time'] = $bookingDetails->approximately_hours;
        $result['minimum_distance'] = $bookingDetails->upper_trip_distance;
        
        if($bookingDetails->customer_pricing_id == 1)
        {
            $result['booking_type'] = 'normal';
        }
        else if($bookingDetails->customer_pricing_id == 2)
        {
            $result['booking_type'] = 'fixed';
        }
        else
        {
            $result['booking_type'] = 'hourly';
        }
        
        if($bookingDetails->e_pod_required == 1)
        {
            $result['electronic_pod'] = true;
        }
        else
        {
            $result['electronic_pod'] = false;
        }
        if($bookingDetails->phy_pod_required == 1)
        {
            $result['physical_pod'] = true;
        }
        else
        {
            $result['physical_pod'] = false;
        }
        if($bookingDetails->payment_option == 'pre')
        {
            $result['payment_at_pickup'] = true;
        }
        else
        {
            $result['payment_at_pickup'] = false;
        }
        if($bookingDetails->loading_required == 1)
        {
            $result['loading'] = true;
        }
        else
        {
            $result['loading'] = false;
        }
        if($bookingDetails->unloading_required == 1)
        {
            $result['unloading'] = true;
        }
        else
        {
            $result['unloading'] = false;
        }
        if($bookingDetails->covered_required == 1)
        {
            $result['covered'] = true;
        }
        else
        {
            $result['covered'] = false;
        }

        $good = GoodsType::find($bookingDetails->goods_id);
        if($good != '')
        {
            if($good->goods_name == 'Others')
            {
                $result['goods_type'] = $bookingDetails->other_goods_text;
            }
            else
            {
                $result['goods_type'] = $good->goods_name;
            }
        }
        
        $wayPointsArray = array();
        $location = FavoriteLocation::where('booking_id',$bookingId)->first();
        $count = 0;
        if($location != '')
        {
            if($location->pickup_landmark != '')
            {
                $result['mobile_number'] = $location->pickup_number;
                if($location->is_favourite_pickup == 1)
                {
                    $wayPointsArray[$count]['is_favorite'] = true;
                }
                else
                {
                    $wayPointsArray[$count]['is_favorite'] = false;
                }
                
                $wayPointsArray[$count]['is_filled'] = true;
                $wayPointsArray[$count]['is_footer'] = false;
                $wayPointsArray[$count]['is_pickup'] = true;
                $wayPointsArray[$count]['landmark'] = $location->pickup_landmark;
                $wayPointsArray[$count]['latitude'] = $location->pickup_lat;
                $wayPointsArray[$count]['longitude'] = $location->pickup_lng;
                $count = $count + 1;
            }
            
            $wayPoints = CustomerDropPoints::where('booking_id',$bookingId)->get();
        
            if($wayPoints != '')
            {
                foreach ($wayPoints as $key => $value) 
                {
                    if($value->is_favourite == 1)
                    {
                        $wayPointsArray[$count]['is_favorite'] = true;
                    }
                    else
                    {
                        $wayPointsArray[$count]['is_favorite'] = false;
                    }
                    $wayPointsArray[$count]['is_filled'] = true;
                    $wayPointsArray[$count]['is_footer'] = false;
                    $wayPointsArray[$count]['is_pickup'] = false;
                    $wayPointsArray[$count]['landmark'] = $value->drop_landmark;
                    $wayPointsArray[$count]['latitude'] = $value->drop_lat;
                    $wayPointsArray[$count]['longitude'] = $value->drop_lng;
                    $count++;
                }
            }

            if($location->drop_landmark != '')
            {
                if($location->is_favourite_drop == 1)
                {
                    $wayPointsArray[$count]['is_favorite'] = true;
                }
                else
                {
                    $wayPointsArray[$count]['is_favorite'] = false;
                }
                $wayPointsArray[$count]['is_filled'] = true;
                $wayPointsArray[$count]['is_footer'] = false;
                $wayPointsArray[$count]['is_pickup'] = false;
                $wayPointsArray[$count]['landmark'] = $location->drop_landmark;
                $wayPointsArray[$count]['latitude'] = $location->drop_lat;
                $wayPointsArray[$count]['longitude'] = $location->drop_lng;
                $count = $count + 1;
            }
        }

        $result['landmark_list'] = $wayPointsArray;
        $result['schedule_time_edit'] = true; 
        $result['pickup_address_edit'] = true; 
        $result['drop_address_edit'] = true; 
        $result['type_of_booking_edit'] = true;
        $result['loading_edit'] = true;
        $result['unloading_edit'] = true;
        $result['payment_method_edit'] = true;
        $result['pod_edit'] = true;
        $result['number_of_drop_point_edit'] = true;
        $result['is_goods_type_edit'] = true;
        $result['all_edit'] = true;
        $result['is_contact_edit'] = true;
        $result['is_tip_edit'] = true;
        $result['is_vehicle_edit'] = true;
        $result['is_fav_driver_edit'] = true;
        
        $bookingStatus = BookingStatus::where('booking_id',$bookingId)->first();
        if($bookingStatus != '')
        {
            if($bookingStatus->to_customer_time != '' && $bookingStatus->complete == '')
            {
                $result['schedule_time_edit'] = false; 
                $result['pickup_address_edit'] = false; 
                $result['payment_method_edit'] = false;
                $result['is_goods_type_edit'] = false;
                $result['is_contact_edit'] = false;
                $result['is_tip_edit'] = false;
                $result['is_vehicle_edit'] = false;
                $result['is_fav_driver_edit'] = false;

            }
            if($bookingStatus->start_time != '' && $bookingStatus->complete == '')
            {
                $result['schedule_time_edit'] = false; 
                $result['drop_address_edit'] = false; 
                $result['type_of_booking_edit'] = false;
                $result['loading_edit'] = false;
                $result['pod_edit'] = false;
                $result['number_of_drop_point_edit'] = false;
                $result['all_edit'] = false;
                $result['unloading_edit'] = false;
            }
            if($bookingDetails->payment_option == 'pre' && $bookingStatus->loading_time != '')
            {
                $result['schedule_time_edit'] = false; 
                $result['drop_address_edit'] = false; 
                $result['type_of_booking_edit'] = false;
                $result['loading_edit'] = false;
                $result['pod_edit'] = false;
                $result['number_of_drop_point_edit'] = false;
                $result['all_edit'] = false;
                $result['unloading_edit'] = false;
            }
            if($bookingStatus->start_time == '')
            {
                $result['payment_method_edit'] = true;
            }


            if($bookingDetails->payment_option == 'post'  && $bookingStatus->billing_time == '' )
            {
                $result['unloading_edit'] = true;
            }
            
        }
        if ($bookingDetails->driver_id != 0) 
        {

            $driverLoginDetials = DriverDetials::where('driver_id', $bookingDetails->driver_id)->orderBy('id', 'desc')->first();
            if ($driverLoginDetials != "") 
            {
                if ($driverLoginDetials->loading_unloading_status != 'yes') 
                {
                    $result['loading_edit'] = false;
                    $result['unloading_edit'] = false;
                }
                
            }
        }

        if($result != "")
        {   
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $result;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found..";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used Update or changes booking fav to reguler
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function updateCustomerBooking(Request $request)
    {
        $convertText = new TranslateClient();
        $convertText->setSource('en');
        $convertText->setTarget('hi');
        //$data     = $request->all();
        $rawData = file_get_contents("php://input");
        $data = (array) json_decode($rawData);
        
        if(isset($data['customer_id']))
        {
            $customerId = $data['customer_id'];
            $getCustomer = Customer::find($data['customer_id']);
            if($getCustomer->status == 'inactive')
            {
                $response['success'] = false;
                $response['message'] = "This user account has been temporarily suspended. Please contact MaalGaadi for further assistance.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['booking_id']))
        { 
            $bookingId = $data['booking_id'];
            $booking = Booking::find($bookingId);
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingEstimate = (array) $data['booking_estimate']->data;
        if(isset($data['selected_vehicle_category']))
        { 
            $vehicleId = $data['selected_vehicle_category'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Vehicle category is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingStatus = BookingStatus::where('booking_id',$bookingId)->first();
        if($bookingStatus != '')
        {
            if($bookingStatus->start_time != '' && $bookingStatus->complete == '')
            {
                $response['success'] = false;
                $response['message'] = "Booking is alloted to driver so it is not possible to update.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        $otherGood = '';
        $goodId    = '';
        $good      = '';
        $goodType  = '';
        $remark    = '';
        $numberOfDropPoints = 1;
        $coveredStatus      = 1;

        if(isset($data['goods_id']))
        {
            $goodId = $data['goods_id'];
        }
        else
        {
            $goodId = 1;
        }
        
        if($goodId != '')
        { 
            $good = GoodsType::find($goodId);
            if($good != '') 
            {
                $goodType = $good->goods_name;
            }
        }
        if($goodType == 'Others'){
            if(isset($data['goods_type']))
            {
                $otherGood = $data['goods_type'] ; 
                $goodType = $otherGood;
            }
        }
        
        if(isset($data['booking_time']))
        {
            $bookingScheduleTime = strtotime($data['booking_time']);
        }
        else
        {
           $bookingScheduleTime = strtotime(date('Y-m-d H:i:s'));
        }

        $currentTimeInSecond = strtotime(date('Y-m-d H:i:s'));
        
        $setting    = MaalgaadiSettings::where('city_id', $getCustomer->city_id)->first();
        if($bookingScheduleTime == 0 || $bookingScheduleTime < $currentTimeInSecond)
        {
            $bookingScheduleTime = strtotime("+5 minutes", strtotime(date('Y-m-d H:i:s')));
        }
        
        if(isset($data['remark']))
        {
            $remark = $data['remark'];
        }
        
        if(isset($data['number_of_drop_points']) && $data['number_of_drop_points'] != 0)
        {
           $numberOfDropPoints = $data['number_of_drop_points'];
        }
                
        if(isset($data['vehicle_type']) && $data['vehicle_type'] != 'covered')
        { 
            $coveredStatus = 0; 
        }
        
        if(isset($bookingEstimate['upper_estimated_distance_in_meter']))
        {
            $upperEstimatedDistance = $bookingEstimate['upper_estimated_distance_in_meter'];
        }
        else
        {
           $upperEstimatedDistance = 0;
        }
        if(isset($bookingEstimate['lower_estimated_distance_in_meter']))
        {
           $lowerEstimatedDistance = $bookingEstimate['lower_estimated_distance_in_meter'];
        }
        else
        {
           $lowerEstimatedDistance = 0;
        }
        if(isset($bookingEstimate['pod']))
        {
            $pod = $bookingEstimate['pod']; 
            $podCharge = $bookingEstimate['pod_charge'];
        }
        else
        {
            $pod = 0;
            $podCharge = 0;
        }

        if(isset($bookingEstimate['e_pod']))
        {
            $ePod = $bookingEstimate['e_pod']; 
        }
        else
        {
            $ePod = 0;
        } 

        if(isset($data['loading']) && $data['loading'] == true)
        {
            $loading = 1;
        }
        else
        {
            $loading = 0;
        }

        if(isset($data['unloading']) && $data['unloading'] == true)
        {
            $unloading = 1;
        }
        else
        { 
           $unloading = 0;
        }
        
        if($data['booking_type'])
        { 
            $bookingType = $data['booking_type'];
        }
        else
        {
            $bookingType = 'normal';
        }

        if(isset($data['minimum_time']))
        { 
            $hourlyEstTime = $data['minimum_time'];
        }
        else
        {
            $hourlyEstTime = 0;
        } 

        if(isset($data['mobile_number']))
        {
            $pickupNumber = $data['mobile_number'];
        }
        else
        {
            $pickupNumber = 0;
        }
        
        if(isset($data['mobile_number']))
        {
            $dropMobile = $data['mobile_number'];
        }
        else
        {
            $dropMobile = 0;
        }
        
        if(isset( $bookingEstimate['pic_address']))
        { 
           $pickupLandmark = $bookingEstimate['pic_address'];
        }
        else
        {
            $pickupLandmark = '';
        }
        
        if(isset($bookingEstimate['drop_address']))
        {
             $dropLandmark = $bookingEstimate['drop_address'];
        }
        else
        {
            $dropLandmark = '';
        }     

        if(isset($bookingEstimate['pick_lat']))
        {
            $pickupLat = $bookingEstimate['pick_lat'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Pickup point is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($bookingEstimate['pick_lng']))
        {
           $pickupLng = $bookingEstimate['pick_lng'];
        }
        else 
        {
            $response['success'] = false;
            $response['message'] = "Pickup point is required.";
            $response['data']    = (object) array();
            return $response;
        }
       
        if(isset($bookingEstimate['drop_lat']))
        {
            $dropLat = $bookingEstimate['drop_lat'];
        }
        else
        {
            $dropLat = 0;
        }
        
        if(isset($bookingEstimate['drop_lng']))
        {
            $dropLng = $bookingEstimate['drop_lng'];
        }
        else
        {
            $dropLng = 0;
        }
        
        if(isset($bookingEstimate['is_favorite_pickup']) && ($bookingEstimate['is_favorite_pickup']== 1) )
        {
            $isFavoritePickup = 1;
        }
        else
        {
            $isFavoritePickup = 0;
        }

        if(isset($bookingEstimate['is_favorite_drop']) && ($bookingEstimate['is_favorite_drop'] == 1) )
        {
            $isFavoriteDrop = 1;
        }
        else
        {
            $isFavoriteDrop = 0;
        }

        if($bookingType == 'hourly')
        {
            $lowerEstimatedDistance = $data['minimum_distance'];
        }
        if(isset($data['payment_at_pickup']) && $data['payment_at_pickup'] == true)
        { 
            $paymentOption = 'pre';
        }
        else
        {
            $paymentOption = 'post';
        } 

        if(isset($data['allot_to_fav_driver']) && $data['allot_to_fav_driver'] == true)
        {
            $favouriteDriverReq = 1;
        }
        else
        {
            $favouriteDriverReq = 0;
        }

        if(isset($data['random_code']) && $data['random_code'] != '')
        {
            $randomCode = $data['random_code'];
        }
        else
        {
            $randomCode = '';
        }

        if(isset($data['booking_event_type']) && $data['booking_event_type'] != '')
        {
            $bookingEventType = $data['booking_event_type'];
        }
        else
        {
            $bookingEventType = 'NEW';
        }
         
        if(isset($data['tip']) && $data['tip'] != '')
        {
            $tipCharge = $data['tip'];
        }
        else
        {
            $tipCharge = 0;
        }

        $notNeedToSearch    = false;
        $scheduleTimeEdit   = false;
        $pickupAddressEdit  = false;
        $dropAddressEdit    = false;
        $typeOfBookingEdit  = false;
        $loadingEdit        = false;
        $unloadingEdit      = false;
        $paymentMethodEdit  = false;
        $podEdit            = false;
        $numberOfDropPointEdit  = false; 

        $notNeedToSearch    = $data['book_later'];
        $scheduleTimeEdit   = $data['schedule_time_edit'];
        $pickupAddressEdit  = $data['pickup_address_edit'];
        $dropAddressEdit    = $data['drop_address_edit'];
        $paymentMethodEdit  = $data['payment_method_edit'];
        $podEdit            = $data['pod_edit'];
        $numberOfDropPointEdit  = $data['number_of_drop_point_edit']; 
        
        if($data['loading'] == true && $booking->loading_required == 0)
        {
            $loadingEdit = true;
        }
        if($data['loading'] == false && $booking->loading_required == 1)
        {
            $loadingEdit = true;
        }
        if($data['unloading'] == true && $booking->unloading_required == 0)
        {
            $unloadingEdit = true;
        }
        if($data['unloading'] == false && $booking->unloading_required == 1)
        {
            $unloadingEdit = true;
        }
        if($data['unloading'] == false && $booking->unloading_required == 1)
        {
            $typeOfBookingEdit = true;
        }
        $billingType = BillingType::where('type',$bookingType)->first();
        if($booking->driver_pricing_id != $billingType->id )
        {
            $typeOfBookingEdit = true;
        }
        $booking->customer_id        = $customerId;
        $booking->city_id            = $getCustomer->city_id;
        $booking->employee_id        = 44;
        $booking->updated_by         = 44;
        $booking->vehicle_id         = $vehicleId;
        $booking->notes              = '';
        $booking->goods_id           = $goodId;
        $booking->drop_points        = $numberOfDropPoints;
        $booking->allotment_type     = 0;
        $booking->other_goods_text   = $otherGood;
        $booking->current_status     = 'booked';
        $booking->covered_required   = $coveredStatus;
        $booking->estimate_upper_trip_distance   = round(($upperEstimatedDistance/1000),2); 
        $booking->upper_trip_distance   = round(($upperEstimatedDistance/1000),2); 
        $booking->lower_trip_distance   = round(($lowerEstimatedDistance/1000),2); 
        $booking->phy_pod_required   = $pod;
        $booking->e_pod_required     = $ePod;
        $booking->loading_required   = $loading;
        $booking->unloading_required = $unloading;
        $booking->customer_pricing_id = $billingType->id;
        $booking->driver_pricing_id  = $billingType->id;
        $booking->approximately_hours = $hourlyEstTime;
        $booking->navigation_required = $isFavoritePickup;
        $booking->favourite_driver_required = $favouriteDriverReq;
        $booking->random_code        = $randomCode;
        $booking->booking_event_type        = $bookingEventType;
        $booking->updated_at        = date('Y-m-d H:i:s');
        if($bookingStatus->to_customer_time != '' && $bookingStatus->complete == '')
        {
            $booking->requirement_time   = date('Y-m-d H:i:s',$bookingScheduleTime);
            $booking->payment_option     = $paymentOption;
        }
        $booking->save();
        $bookingID = $booking->id;
        
        $bookingStatus               =  BookingStatus::where('booking_id',$bookingID)->first();
        $bookingStatus->booking_id   = $booking->id;
        $bookingStatus->booking_time = date('Y-m-d H:i:s',$bookingScheduleTime);
        $bookingStatus->save();

        $favoriteLocation                      =  FavoriteLocation::where('booking_id',$bookingID)->first();;
        $favoriteLocation->booking_id          =  $bookingID;
        $favoriteLocation->customer_id         =  $customerId;
        if($bookingStatus->to_customer_time == '')
        {
            $favoriteLocation->pickup_number       =  $pickupNumber;
            $favoriteLocation->pickup_landmark     =  $pickupLandmark;
            $favoriteLocation->pickup_lat          =  $pickupLat;
            $favoriteLocation->pickup_lng          =  $pickupLng;
        }
        if($bookingStatus->start_time == '')
        {
            $favoriteLocation->drop_number         =  $dropMobile; 
            $favoriteLocation->drop_landmark       =  $dropLandmark;
            $favoriteLocation->drop_lat            =  $dropLat;
            $favoriteLocation->drop_lng            =  $dropLng;
        }
        $favoriteLocation->is_favourite_pickup =  $isFavoritePickup;
        $favoriteLocation->is_favourite_drop   =  $isFavoriteDrop;
        $favoriteLocation->save();
        // Discount Code 
        BookingDiscountCode::where('booking_id',$bookingID)->delete();
        if(isset($data['discount_code_id']) && $data['discount_code_id'] != '')
        {
            $discountCodeId = $data['discount_code_id'];
            $code = new BookingDiscountCode;
            $code->booking_id = $bookingID;
            $code->customer_id = $customerId;
            $code->discount_coupon_id = $discountCodeId;
            $code->created_at = date('Y-m-d H:i:s');
            $code->save();
            $discountId = $code->id;
            $booking = Booking::find($bookingID);
            $booking->discount_coupon_id = $discountId;
            $booking->save();
        }

        $dropPoints = '';    
        if(isset($data['landmark_list']) && $data['landmark_list'] != '')
        {
            $landmarkListArray = $data['landmark_list'];
            $count = count($landmarkListArray);
            for ($i=0; $i < $count ; $i++) 
            { 
                if($landmarkListArray[$i]->is_pickup == true)
                {
                    $origins = $landmarkListArray[$i]->latitude.','.$landmarkListArray[$i]->longitude;
                    $resultArray['pick_lat'] = $landmarkListArray[$i]->latitude;
                    $resultArray['pick_lng'] = $landmarkListArray[$i]->longitude;
                    $data['pic_address'] = $landmarkListArray[$i]->landmark;
                }
            }
        }
        if(isset($data['landmark_list']) && $data['landmark_list'] != '')
        { 
            $dropPoints = $data['landmark_list'];
        }
        if($bookingStatus->start_time == '')
        {
            CustomerDropPoints::where('booking_id',$bookingID)->delete();
            if($dropPoints != '' && $numberOfDropPoints > 1)
            {
                $countLoc = count($dropPoints);
                $countLoc = $countLoc - 1;
                foreach ($dropPoints as $key => $value) 
                {   
                    if($value->is_pickup == false && $key != $countLoc ) 
                    {
                        if($value->is_favorite == true ) 
                        {
                            $favorite = 1;
                        }
                        else
                        {
                            $favorite = 0;
                        }
                        $multipleDropPoints                      =  new CustomerDropPoints;
                        $multipleDropPoints->customer_id         =  $customerId;
                        $multipleDropPoints->booking_id          =  $bookingID;
                        $multipleDropPoints->drop_number         =  ''; 
                        $multipleDropPoints->drop_landmark       =  $value->landmark;
                        $multipleDropPoints->drop_lat            =  $value->latitude;
                        $multipleDropPoints->drop_lng            =  $value->longitude;
                        $multipleDropPoints->is_favourite        =  $favorite;
                        $multipleDropPoints->save();
                    }
                }
            }
        }
        if(isset($bookingEstimate['upper_trip_charge']))
        {
            $tripCharge = $bookingEstimate['upper_trip_charge'];
        }
        else 
        {
            $tripCharge = 0;
        }
        
        if(isset($bookingEstimate['lower_trip_charge']))
        {
            $lowerTripCharge = $bookingEstimate['lower_trip_charge']; 
        }
        else
        {
            if($data['booking_type'] == 'hourly')
            {
                $lowerTripCharge = $tripCharge;
            }
            else
            {
                $lowerTripCharge = 0;
            }
        }
        
        if(isset($bookingEstimate['loading_charge']))
        {
            $loadingCharge = $bookingEstimate['loading_charge'];
        }
        else
        {
            $loadingCharge = 0;
        }

        if(isset($bookingEstimate['unloading_charge']))
        {
            $unloadingCharge = $bookingEstimate['unloading_charge'];
        }
        else 
        {
            $unloadingCharge = 0;
        }
       
        if($bookingEstimate['discount_amount'])
        {
            $discountAmount = $bookingEstimate['discount_amount'];
        }
        else
        {
            $discountAmount = 0;
        }
        
        if(isset($bookingEstimate['surge_amount']))
        { 
            $surgeAmount = $bookingEstimate['surge_amount'];
        }
        else
        {
            $surgeAmount = 0;
        }

        if(isset($bookingEstimate['surge_percentage']))
        { 
            $surgePercentage = $bookingEstimate['surge_percentage'];
        }
        else
        {
            $surgePercentage = 0;
        }

        if(isset($bookingEstimate['drop_point_charge']))
        { 
            $dropPointCharge = $bookingEstimate['drop_point_charge'];
        }
        else
        {
            $dropPointCharge = 0;
        }

        $bookingCustomerDetails                     = BookingCustomerDetails::where('booking_id',$bookingID)->first();;
        $bookingCustomerDetails->booking_id         = $booking->id;
        $bookingCustomerDetails->estimate_upper_trip_charge = $tripCharge;
        $bookingCustomerDetails->trip_charge        = $tripCharge;
        $bookingCustomerDetails->lower_trip_charge  = $lowerTripCharge;
        $bookingCustomerDetails->loading_charge     = $loadingCharge;
        $bookingCustomerDetails->unloading_charge   = $unloadingCharge;
        $bookingCustomerDetails->drop_points_charge = $dropPointCharge;
        $bookingCustomerDetails->pod_charge         = $podCharge;
        $bookingCustomerDetails->estimate_surge_charge  = $surgeAmount;
        $bookingCustomerDetails->estimate_discount_amount  = $discountAmount;
        $bookingCustomerDetails->surge_percentage  = $surgePercentage;
        $bookingCustomerDetails->reference_text = $remark;
        if($bookingStatus->to_customer_time == '')
        {
            $bookingCustomerDetails->tip_charge     = $tipCharge;
        }
        $bookingCustomerDetails->save();
        $mgBonus = 0;
        $mgBonusPercentage = 0;
        if($bookingCustomerDetails->estimate_surge_charge != 0)
        {
            $tripAmount = $bookingCustomerDetails->trip_charge + $bookingCustomerDetails->loading_charge + $bookingCustomerDetails->unloading_charge + $bookingCustomerDetails->pod_charge + $bookingCustomerDetails->drop_points_charge;
            $commonFunction = new CommonFunctionController;
            $timeSchedule = date('Y-m-d H:i:s',$bookingScheduleTime);
            $area = array(
                    'pick_lat' => $pickupLat,
                    'pick_lng' => $pickupLng,
                    'drop_lat' => $dropLat,
                    'drop_lng' => $dropLng,
                    'booking_schedule_time' => $timeSchedule
                    );
            $driverSurgeData = $commonFunction->driverSurgeCalculation($customerId, $vehicleId, $tripAmount, $area, $timeSchedule);
            
            $mgBonus = $driverSurgeData['estimate_driver_surge_charge'];
            $mgBonusPercentage = $driverSurgeData['estimate_driver_surge_percentage']; 

            $settingKey = 'allow_'.$bookingType;

            $getSurgeSetting = SurgeSetting::where('vehicle_id', $vehicleId)->first();

            if($getSurgeSetting != '' && $getSurgeSetting->$settingKey == 1) 
            {

                $response = $commonFunction->surgeCalculation($customerId, $vehicleId, $tripAmount,'', $area, $timeSchedule); 
                
                $differentBookingSurges = BookingSurgeParameter::where('booking_id', $bookingID)->first();
                if($differentBookingSurges)
                {
                    $differentBookingSurges->usage_surge_percent        = $response['usageSurgePercentage'];
                    $differentBookingSurges->usage_surge_amount         = $response['usageSurgeAmount'];
                    $differentBookingSurges->day_surge_percent          = $response['daySurgePercentage'];
                    $differentBookingSurges->day_surge_amount           = $response['daySurgeAmount'];
                    $differentBookingSurges->date_surge_percent         = $response['dateSurgePercentage'];
                    $differentBookingSurges->date_surge_amount          = $response['dateSurgeAmount'];
                    $differentBookingSurges->area_surge_percent         = $response['areaSurgePercentage'];
                    $differentBookingSurges->area_surge_amount          = $response['areaSurgeAmount'];
                    $differentBookingSurges->callcenter_surge_percent   = $response['callCenterSurgePercentage'];
                    $differentBookingSurges->callcenter_surge_amount    = $response['callCenterSurgeAmount'];
                    $differentBookingSurges->extra_surge_percent        = $response['extraSurgePercentage'];
                    $differentBookingSurges->extra_surge_amount         = $response['extraSurgeAmount'];
                    $differentBookingSurges->created_at                 = date("Y-m-d H:i:s");
                    $differentBookingSurges->updated_at                 = date("Y-m-d H:i:s");
                    $differentBookingSurges->save();
                }
                else
                {
                    $differentBookingSurges = new BookingSurgeParameter;
                    $differentBookingSurges->booking_id                 = $bookingID;
                    $differentBookingSurges->usage_surge_percent        = $response['usageSurgePercentage'];
                    $differentBookingSurges->usage_surge_amount         = $response['usageSurgeAmount'];
                    $differentBookingSurges->day_surge_percent          = $response['daySurgePercentage'];
                    $differentBookingSurges->day_surge_amount           = $response['daySurgeAmount'];
                    $differentBookingSurges->date_surge_percent         = $response['dateSurgePercentage'];
                    $differentBookingSurges->date_surge_amount          = $response['dateSurgeAmount'];
                    $differentBookingSurges->area_surge_percent         = $response['areaSurgePercentage'];
                    $differentBookingSurges->area_surge_amount          = $response['areaSurgeAmount'];
                    $differentBookingSurges->callcenter_surge_percent   = $response['callCenterSurgePercentage'];
                    $differentBookingSurges->callcenter_surge_amount    = $response['callCenterSurgeAmount'];
                    $differentBookingSurges->extra_surge_percent        = $response['extraSurgePercentage'];
                    $differentBookingSurges->extra_surge_amount         = $response['extraSurgeAmount'];
                    $differentBookingSurges->created_at                 = date("Y-m-d H:i:s");
                    $differentBookingSurges->updated_at                 = date("Y-m-d H:i:s");
                    $differentBookingSurges->save();
                }
            }
        }
        $bookingDriverDetails                       = BookingDriverDetails::where('booking_id',$bookingID)->first();;
        $bookingDriverDetails->booking_id           = $booking->id;
        $bookingDriverDetails->estimate_upper_trip_charge = $tripCharge;
        $bookingDriverDetails->trip_charge          = $tripCharge;
        $bookingDriverDetails->lower_trip_charge    = $lowerTripCharge;
        $bookingDriverDetails->loading_charge       = $loadingCharge;
        $bookingDriverDetails->unloading_charge     = $unloadingCharge;
        $bookingDriverDetails->drop_points_charge   = $dropPointCharge;
        if($bookingStatus->to_customer_time == '')
        {
            $bookingCustomerDetails->tip_charge         = $tipCharge;
        }
        $bookingDriverDetails->estimate_driver_surge_charge = $mgBonus;
        $bookingCustomerDetails->estimate_driver_surge_percentage = $mgBonusPercentage;
        $bookingDriverDetails->save();

        $bookingData = Booking::find($booking->id);
        if($bookingData->driver_id != 0)
        {
            $baseUrl = url('/');
            $url= $baseUrl."/api/editBookingSendNotification?booking_id=".$booking->id."&driver_id=".$bookingData->driver_id."&auto_flag=1&schedule_time_edit=".$scheduleTimeEdit."&pickup_address_edit=".$pickupAddressEdit."&drop_address_edit=".$dropAddressEdit."&type_of_booking_edit=".$typeOfBookingEdit."&loading_edit=".$loadingEdit."&unloading_edit=".$unloadingEdit."&payment_method_edit=".$paymentMethodEdit."&pod_edit=".$podEdit."&number_of_drop_point_edit=".$numberOfDropPointEdit; 
            $this->_backgroundAllotment($url);
        }

        if($notNeedToSearch == false && $bookingData->driver_id == 0)
        {
            if(isset($data['allot_to_fav_driver']) && $data['allot_to_fav_driver'] == true)
            {
                $responseBoolean = $this->_checkFavDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                        $responseArray['data']    = array('responseCode' => 3 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );
                    }
                    
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );

                }
                $data['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($data);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
            else
            {
                $responseBoolean = $this->_checkDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "Trip details have been edited, we'll notify you as soon as a driver is allotted to your booking..";
                        $responseArray['data']    = array('responseCode' => 1 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                    }
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                }
                $data['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($data);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
        }
        $data['booking_id'] = $booking->id;
        $bookingDataArray = $this->getCustomerSingleBooking($data);
        $response['success'] = true;
        if($bookingData->driver_id == 0)
        {
            $response['message'] = "Trip details have been edited, we'll notify you as soon as a driver is allotted to your booking.";
        }
        else
        {
            $getDriverDetails = Driver::find($bookingData->driver_id);
            $response['message'] = "Trip details have been modified. Your driver ".$getDriverDetails->driver_name." has been notified of the changes.";
        }
        
        $response['data']    = array('responseCode' => 4 , 'booking_id' => $booking->id );
        $response['trip_data'] = $bookingDataArray;
        return $response;
    }

    # Function : This function used Update or changes booking fav to regular
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    
    public function bookingResponseUpdate(Request $request)
    {
        $data     = $request->all();
        if(isset($data['booking_id']) && $data['booking_id'] != '')
        {
            $bookingId = $data['booking_id']; 
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $isSearch = true;

        $booking = Booking::where('id', $bookingId)->first();

        if($booking == '')
        {
            $response['success'] = false;
            $response['message'] = "Booking Id does not exist.";
            $response['data']    = (object) array();
            return $response;
        }

        if($booking->driver != 0)
        {
            $response['success'] = false;
            $response['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingStatus = BookingStatus::where('booking_id',$bookingId)->first();
        
        if(isset($data['wait_time']) && $data['wait_time'] != '')
        {
            $bufferTime = $data['wait_time'] * 60;

            $bookingScheduleTime = strtotime("+". $bufferTime ." minutes", strtotime($booking->requirement_time));
            $booking->requirement_time = date('Y-m-d H:i:s',$bookingScheduleTime);
            $bookingStatus->booking_time = date('Y-m-d H:i:s',$bookingScheduleTime);
            $bookingStatus->save();
            $booking->save();
            $baseUrl = url('/');
            $notificationUrl = $baseUrl.'/api/sendBookingAddedNotification/'.$bookingId;
            $this->_backgroundAllotment($notificationUrl);
            $isSearch = false;
        }
        if(isset($data['fav_driver_required']) && $data['fav_driver_required'] == 'false')
        { 
            $booking->favourite_driver_required = 0;
            $booking->save();
        }
        else
        {
            $booking->favourite_driver_required = 1;
            $booking->save();
        } 
        
        
        $bookingScheduleTime = strtotime($booking->requirement_time);
        $chekNextMin = strtotime(date("Y-m-d H:i:s", strtotime("+40 minutes")));
        if($bookingScheduleTime < $chekNextMin && $isSearch == true)
        {
            if($booking->favourite_driver_required == 1)
            {
                $responseBoolean = $this->_checkFavDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                        $responseArray['data']    = array('responseCode' => 3 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );
                    }
                    
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );

                }
                $data['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($data);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
            else
            {
                $responseBoolean = $this->_checkDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details ";
                        $responseArray['data']    = array('responseCode' => 1 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                    }
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                }
                $data['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($data);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
        }
        $data['booking_id'] = $booking->id;
        $bookingDataArray = $this->getCustomerSingleBooking($data);
        $response['success'] = true;
        
        if($data['booking_event'] == 'EDIT')
        {
            if($booking->driver_id == 0 )
            {
                $response['message'] = "Trip details have been edited, we'll notify you as soon as a driver is allotted to your booking.";
            }
            else
            {
                $getDriverDetails = Driver::find($bookingData->driver_id);
                $response['message'] = "Trip details have been modified. Your driver ".$getDriverDetails->driver_name." has been notified of the changes.";
            }
        }
        else
        {
            $response['message'] = "Your booking has been saved with us. We will notify you as soon as a driver is allotted.";
        }
        $response['data']    = $bookingDataArray;
        return $response;

    }


    # Function : This function used Update or changes booking fav to regular
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    
    public function fixedBookingResponseUpdate(Request $request)
    {
        $data     = $request->all();
        
        if(isset($data['booking_id']) && $data['booking_id'] != '')
        {
            $bookingId = $data['booking_id']; 
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $isSearch = true;
        $booking = Booking::where('id',$bookingId)->first();
        if($booking->driver != 0)
        {
            $response['success'] = false;
            $response['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingStatus = BookingStatus::where('booking_id',$bookingId)->first();
        if($booking == '')
        {
            $response['success'] = false;
            $response['message'] = "Booking Id does not exist.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['wait_time']) && $data['wait_time'] != '')
        {
            $bufferTime = $data['wait_time'] * 60;

            $bookingScheduleTime = strtotime("+". $bufferTime ." minutes", strtotime($booking->requirement_time));
            $booking->requirement_time = date('Y-m-d H:i:s',$bookingScheduleTime);
            $bookingStatus->booking_time = date('Y-m-d H:i:s',$bookingScheduleTime);
            $bookingStatus->save();
            $booking->save();
        }
        if(isset($data['fav_driver_required']) && $data['fav_driver_required'] == 'false')
        { 
            $booking->favourite_driver_required = 0;
            $booking->save();
        }
        else
        {
            $booking->favourite_driver_required = 1;
            $booking->save();
        } 
        $dataNew = array();
        $bookingScheduleTime = strtotime($booking->requirement_time);
        $chekNextMin = strtotime(date("Y-m-d H:i:s", strtotime("+40 minutes")));
        if($bookingScheduleTime < $chekNextMin && $isSearch == true)
        {
            if($booking->favourite_driver_required == 1)
            {
                $responseBoolean = $this->_checkFavDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                        $responseArray['data']    = array('responseCode' => 3 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );
                    }
                    
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );

                }
                $dataNew['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($dataNew);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
            else
            {
                $responseBoolean = $this->_checkDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details ";
                        $responseArray['data']    = array('responseCode' => 1 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                    }
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                }
                $dataNew['booking_id'] = $booking->id;
                $bookingDataArray = $this->getCustomerSingleBooking($dataNew);
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
        }
        $dataNew['booking_id'] = $booking->id;
        $bookingDataArray = $this->getCustomerSingleBooking($dataNew);
        $response['success'] = true;
        $response['message'] = "Booking has been update.";
        $response['data']    = array('responseCode' => 4 , 'booking_id' => $booking->id );
        $response['trip_data'] = $bookingDataArray;
        return $response;

    }

    # Function : This function used Update or changes booking fav to regular
    # Request : Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    
    public function updateTipAmount(Request $request)
    {
        $data     = $request->all();
        if(isset($data['booking_id']) && $data['booking_id'] != '')
        {
            $bookingId = $data['booking_id']; 
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $isSearch = true;

        $booking = Booking::where('id',$bookingId)->first();
        $bookingCustomerDetails = BookingCustomerDetails::where('booking_id',$bookingId)->first();
        $bookingDriverDetails = BookingDriverDetails::where('booking_id',$bookingId)->first();
        if($booking == '')
        {
            $response['success'] = false;
            $response['message'] = "Booking Id does not exist.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['tip']) && $data['tip'] != '')
        {
            $bookingCustomerDetails->tip_charge = $data['tip'];
            $bookingDriverDetails->max_tip_charge = $data['tip'];
            $bookingCustomerDetails->save();
            $bookingCustomerDetails->save();
            $booking->save();
        }
         
        $dataNew = array();
        $dataNew['booking_id'] = $bookingId;
        $bookingDataArray = $this->getCustomerSingleBooking($dataNew);
        
        $bookingScheduleTime = strtotime($booking->requirement_time);
        $chekNextMin = strtotime(date("Y-m-d H:i:s", strtotime("+40 minutes")));
        if($bookingScheduleTime < $chekNextMin && $isSearch == true)
        {
            if($booking->favourite_driver_required == 1)
            {
                $responseBoolean = $this->_checkFavDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                        $responseArray['data']    = array('responseCode' => 3 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );
                    }
                    
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );

                }
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
            else
            {
                $responseBoolean = $this->_checkDriverAvailable($booking->id);
                if($responseBoolean == true)
                {
                    $checkBookingIsAlloted = '';
                    for ($i=0; $i < 8; $i++) 
                    { 
                        sleep(5);
                        $checkBookingIsAlloted = Booking::find($booking->id);
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            break;
                        }
                    }
                    if($checkBookingIsAlloted->driver_id != 0)
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details ";
                        $responseArray['data']    = array('responseCode' => 1 , 'booking_id' => $booking->id );
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                    }
                }
                else
                {
                    $responseArray['success'] = true;
                    $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                    $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                }
                $responseArray['trip_data'] = $bookingDataArray;
                return $responseArray;
            }
        }
        
        $response['success'] = true;
        $response['message'] = "Booking has been update.";
        $response['data']    = array('responseCode' => 4 , 'booking_id' => $booking->id );
        $response['trip_data'] = $bookingDataArray;
        return $response;

    }

    

    # Function : This function used for Add Favourite Driver to customer 
    # Request : Customer Id , driver Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    # Modify By Vinod Kumar
    public function addFavouriteDriver(Request $request)
    {
        $data = $request->all();
        $customerId = NULL;
        $driverId = NULL;
        $mgCode = NULL;
        
        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['mg_code']) && $data['mg_code'])
        {
            $mgCode = $data['mg_code'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "MgCode id required.";
            $response['data']    = (object) array();
            return $response;
        }

        $mgCodeLength = strlen($mgCode);
        if($mgCodeLength < 6)
        {
            $mgcodeArray = explode('MG', $mgCode);
            $mgCodeInt = end($mgcodeArray);
            if(strlen($mgCodeInt) < 4)
            {
                $addZeroInMgCodeLength = 4 - strlen($mgCodeInt);
                if($addZeroInMgCodeLength == 1)
                {
                    $mgCode = 'MG0'.$mgCodeInt;
                }

               if($addZeroInMgCodeLength == 2)
                {
                    $mgCode = 'MG00'.$mgCodeInt;
                }

               if($addZeroInMgCodeLength == 3)
                {
                    $mgCode = 'MG000'.$mgCodeInt;
                }
            }
        }
        $customerDetails = Customer::select('id','cust_name','cust_organization','city_id')->find($customerId);
        if($customerDetails == '')
        {
            $response['success'] = false;
            $response['message'] = "Customer not registered.";
            $response['data']    = (object) array();
            return $response;
        }

        $cityId = $customerDetails->city_id;
        $driverPrimeSetting = DriverPrimeSetting::where('city_id', $cityId)->first();
        if($driverPrimeSetting && $driverPrimeSetting->prime_allow_fav_driver == '1')
        {
            $driverIdentyDetail = Driver::where('mg_id','LIKE', $mgCode)->where('is_prime','1')->where('city_id', $cityId)->first();
        }
        else
        {
            $driverIdentyDetail = Driver::where('mg_id','LIKE', $mgCode)->where('city_id', $cityId)->first();
        }

        if($driverIdentyDetail)
        {
            $driverId = $driverIdentyDetail->id;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Invalid MG Code. Please enter a valid MG Code.";
            $response['data']    = (object) array();
            return $response;
        }
        if($customerId && $driverId)
        {
            $customerDetails = Customer::select('id','cust_name','cust_organization','city_id')->find($customerId);
            if($customerDetails == '')
            {
                $response['success'] = false;
                $response['message'] = "Customer not registered.";
                $response['data']    = (object) array();
                return $response;
            }

            $driverDetails = Driver::select('id','driver_status','tokenid')->find($driverId);
            if($driverDetails == '')
            {
                $response['success'] = false;
                $response['message'] = "Invalid MG Code. Please enter a valid MG Code.";
                $response['data']    = (object) array();
                return $response;
            }

            if($driverDetails->driver_status == 'Terminate')
            {
                $response['success'] = false;
                $response['message'] = "Invalid MG Code. Please enter a valid MG Code.";
                $response['data']    = (object) array();
                return $response;
            }

            $checkFavouriteDriver = FavouriteDriver::where('customer_id', $customerId)
                                                    ->where('driver_id', $driverId)
                                                    ->first();
            $customerRequestDecline = '';
            if($checkFavouriteDriver)
            {
                if($checkFavouriteDriver->status == 'Declined')
                {
                    $customerRequestDecline = 'Declined';
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Your request has already been sent to this driver.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            
            $maalgaadiSettings = MaalgaadiSettings::where('city_id', $customerDetails->city_id)->first();
            $resultArray       = array();
            $driverAllowedFavouriteCustomer = 0;
            $customerAllowedFavouriteDriver = 0;

            $driverAllowedFavouriteCustomer = $maalgaadiSettings->driver_allowed_favourite_customer;
            $customerAllowedFavouriteDriver = $maalgaadiSettings->customer_allowed_favourite_driver;
            
            $customerFavouriteDriverDetails = FavouriteDriver::where('customer_id', $customerId)->where('delete_flag','0')->orderBy('id','desc')->get();
            $driverFavouriteCustomer = FavouriteDriver::where('status','!=','Declined')->where('driver_id', $driverId)->where('delete_flag','0')->get();
            $customerFavouriteTotal = count($customerFavouriteDriverDetails);
            $customerFavouriteDriverCount = 0;
            $customerFirstDecline = NULL;
            foreach ($customerFavouriteDriverDetails as $key => $value) 
            {
                if($value->status == 'Declined')
                {
                    $customerFirstDecline = $value->id;
                }
                else
                {
                    $customerFavouriteDriverCount++;
                }
            }

            $driverFavouriteCustomerCount = count($driverFavouriteCustomer);
            if($driverFavouriteCustomerCount >= $driverAllowedFavouriteCustomer)
            {
                $response['success'] = false;
                $response['message'] = "Requested driver can not accept anymore requests. Please contact MaalGaadi for further assistance.";
                $response['data']    = (object) array();
                return $response;
            }

            if($customerFavouriteDriverCount >= $customerAllowedFavouriteDriver)
            {
                $response['success'] = false;
                $response['message'] = "You can only add upto ".$customerAllowedFavouriteDriver." favourite drivers.";
                $response['data']    = (object) array();
                return $response;
            }
            
            if($customerFavouriteTotal >= $customerAllowedFavouriteDriver && $customerFirstDecline)
            {
                $favouriteDriverDelete = array();
                $favouriteDriverDelete['delete_flag'] = '1';
                $favouriteDriverDelete['status'] = 'Declined';
                $favouriteDriverDelete['updated_at'] = date('Y-m-d H:i:s');
                $favouriteDriverDelete['notification_flag'] = '0';
                FavouriteDriver::where('id', $customerFirstDecline)->update($favouriteDriverDelete);
            }
            
            if($customerRequestDecline == 'Declined' || $checkFavouriteDriver)
            {
                $favrouteDriverUpdate = array();
                $favrouteDriverUpdate['status'] = 'Request Sent';
                $favrouteDriverUpdate['created_at'] = date('Y-m-d H:i:s');
                $favrouteDriverUpdate['updated_at'] = date('Y-m-d H:i:s');
                $favrouteDriverUpdate['delete_flag'] = '0';
                $affectedRow = FavouriteDriver::where('customer_id', $customerId)->where('driver_id', $driverId)->update($favrouteDriverUpdate);
                if($affectedRow > 0)
                {
                    $response['success'] = true;
                    $response['message'] = "Your request has been successfully sent. Please wait for the concerned driver to respond.";
                    $response['data']    = (object) array();
                    return $response;
                }
                else
                {
                    $response['success'] = false;
                    $response['message'] = "Your request can not be processed at the moment. Please try again later.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            else
            {

                $favouriteDriver              = new FavouriteDriver;
                $favouriteDriver->customer_id = $customerId;
                $favouriteDriver->driver_id   = $driverId;
                $favouriteDriver->status      = 'Request Sent';
                $favouriteDriver->delete_flag = '0';
                $favouriteDriver->created_at  = date('Y-m-d H:i:s');
                $favouriteDriver->updated_at  = date('Y-m-d H:i:s');
                $favouriteDriver->save();
                
                $response['success'] = true;
                $response['message'] = "Your request has been successfully sent. Please wait for the concerned driver to respond.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id & Driver Id required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for delete Favourite Driver from customer 
    # Request : Customer Id , driver Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    # Modify By Vinod Kumar
    public function customerActiveFavouriteDriverList(Request $request)
    {
        $data = $request->all();
        $customerId = NULL;
        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $currentDate = strtotime(date('Y-m-d'));
        $previousDate = date('Y-m-d 00:00:00', strtotime('-2 days', $currentDate));
        if($customerId)
        {
            $getCustomer = Customer::find($customerId);
            $allowedFavouriteDriver = 0;
            $maalgaadiSettings = MaalgaadiSettings::where('city_id',  $getCustomer->city_id)->first();
            $allowedFavouriteDriver = $maalgaadiSettings->customer_allowed_favourite_driver;
            
            $favrouteDriverList = FavouriteDriver::where('customer_id', $customerId)->where('delete_flag','0')->where('status','Active')->get();

            $activeDriver = 0;
            $pendingDriver = 0;
            $declineDriver = 0;
            $favouriteDriverIds = array();
            foreach ($favrouteDriverList as $key => $value) 
            {
                array_push($favouriteDriverIds, $value->driver_id);
            }
            $driverDetails = Driver::select('id','driver_name','driver_number','vehicle_reg_no','vehicle_category_id')
                                    ->whereIn('id', $favouriteDriverIds)
                                    ->get()
                                    ->keyBy('id')
                                    ->toArray();

            $getAvgRating = AverageRating::whereIn('user_id', $favouriteDriverIds)->where('user_type','driver')->get()->keyBy('user_id')->toArray();
            
            $getLoginDriver = DriverRegular::whereIn('driver_id',$favouriteDriverIds)->get()->keyBy('driver_id')->toArray();

            $vehicleCategoryIds = array();
            $driverNumberArray  = array();
            foreach ($driverDetails as $key => $value) 
            {   
                array_push($vehicleCategoryIds, $value['vehicle_category_id']);
                array_push($driverNumberArray, $value['driver_number']);
            }                   

            $driverOnBoardingArray   = DriverOnBoarding::whereIn('driver_mbl', $driverNumberArray)->get()->keyBy('driver_mbl')->toArray();
            $vehicleCategoryDetails = VehicleCategory::select('id','vehicle_name')->whereIn('id', $vehicleCategoryIds)->get()->keyBy('id')->toArray();                   
            $result = array();
            foreach ($favrouteDriverList as $key => $value) 
            {
                $favouriteDriver = array();
                $favouriteDriver['profile_image'] = ''; 
                $favouriteDriver['vehicle_name'] = '';
                $favouriteDriver['mg_code'] = '';
                $favouriteDriver['is_online'] = false;
                if(isset($getLoginDriver[$value->driver_id]))
                {
                     $favouriteDriver['is_online'] = true;
                }
                if(isset($driverIdentityDetails[$value->driver_id]))
                {
                     $favouriteDriver['mg_code'] = $driverDetails[$value->driver_id]['mg_id'];
                }

                if(isset($driverDetails[$value->driver_id]))
                {
                    if(isset($driverOnBoardingArray[$driverDetails[$value->driver_id]['driver_number']]))
                    {
                        $favouriteDriver['profile_image'] = "http://billing.maalgaadi.net".$driverOnBoardingArray[$driverDetails[$value->driver_id]['driver_number']]['driver_photo'];
                    }
                }

                if(isset($driverDetails[$value->driver_id]))
                {
                     $favouriteDriver['vehicle_id'] = $driverDetails[$value->driver_id]['vehicle_category_id'];
                }
                
                if(isset($getAvgRating[$value->driver_id]))
                {
                     $favouriteDriver['average_rating'] = $getAvgRating[$value->driver_id]['average_rating'];
                }
                else
                {
                    $favouriteDriver['average_rating'] = 5;
                }
                if(isset($driverDetails[$value->driver_id]))
                {
                    $favouriteDriver['driver_id'] = $value->driver_id;
                    $favouriteDriver['status'] = $value->status;
                    $favouriteDriver['name'] = $driverDetails[$value->driver_id]['driver_name'];
                    $favouriteDriver['vehicle_reg_no'] = $driverDetails[$value->driver_id]['vehicle_reg_no'];
                    $vehicleId = $driverDetails[$value->driver_id]['vehicle_category_id'];
                    if(isset($vehicleCategoryDetails[$vehicleId]))
                    {
                        $favouriteDriver['vehicle_name'] = $vehicleCategoryDetails[$vehicleId]['vehicle_name'];
                    } 
                    
                    if($value->status == 'Declined' && $value->updated_at < $previousDate)
                    {
                        
                    }
                    else
                    {
                        array_push($result, $favouriteDriver);
                    }
                    
                }
            }
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    =  $result;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }


    # Function : This function used for delete Favourite Driver from customer 
    # Request : Customer Id , driver Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    # Modify By Vinod Kumar
    public function customerPendingFavouriteDriverList(Request $request)
    {
        $data = $request->all();
        $customerId = NULL;
        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $currentDate = strtotime(date('Y-m-d'));
        $previousDate = date('Y-m-d 00:00:00', strtotime('-2 days', $currentDate));
        if($customerId)
        {
            $getCustomer = Customer::find($customerId);
            $allowedFavouriteDriver = 0;
            $maalgaadiSettings = MaalgaadiSettings::where('city_id',  $getCustomer->city_id)->first();
            $allowedFavouriteDriver = $maalgaadiSettings->customer_allowed_favourite_driver;
            
            $favrouteDriverList = FavouriteDriver::where('customer_id', $customerId)->where('delete_flag','0')->where('status','!=','Active')->get();
            

            $activeDriver = 0;
            $pendingDriver = 0;
            $declineDriver = 0;
            $favouriteDriverIds = array();
            foreach ($favrouteDriverList as $key => $value) 
            {
                array_push($favouriteDriverIds, $value->driver_id);
            }
            $driverDetails = Driver::select('id','driver_name','driver_number','vehicle_reg_no','vehicle_category_id')
                                    ->whereIn('id', $favouriteDriverIds)
                                    ->get()
                                    ->keyBy('id')
                                    ->toArray();


            
            $vehicleCategoryIds = array();
            $driverNumberArray  = array();
            foreach ($driverDetails as $key => $value) 
            {   
                array_push($vehicleCategoryIds, $value['vehicle_category_id']);
                array_push($driverNumberArray, $value['driver_number']);
            }                   

           

            $vehicleCategoryDetails = VehicleCategory::select('id','vehicle_name')->whereIn('id', $vehicleCategoryIds)->get()->keyBy('id')->toArray();                   
            $result = array();
            foreach ($favrouteDriverList as $key => $value) 
            {
                $favouriteDriver = array();
                $favouriteDriver['profile_image'] = ''; 
                $favouriteDriver['vehicle_name'] = '';
                $favouriteDriver['mg_code'] = '';
                if(isset($driverIdentityDetails[$value->driver_id]))
                {
                     $favouriteDriver['mg_code'] = $driverDetails[$value->driver_id]['mg_id'];
                }

                if(isset($driverDetails[$value->driver_id]))
                {
                    if(isset($driverOnBoardingArray[$driverDetails[$value->driver_id]['driver_number']]))
                    {
                        $favouriteDriver['profile_image'] = "http://billing.maalgaadi.net".$driverOnBoardingArray[$driverDetails[$value->driver_id]['driver_number']]['driver_photo'];
                    }
                }

                if(isset($driverDetails[$value->driver_id]))
                {
                     $favouriteDriver['vehicle_id'] = $driverDetails[$value->driver_id]['vehicle_category_id'];
                }

                if(isset($driverDetails[$value->driver_id]))
                {
                    $favouriteDriver['driver_id'] = $value->driver_id;
                    $favouriteDriver['status'] = $value->status;
                    $favouriteDriver['name'] = $driverDetails[$value->driver_id]['driver_name'];
                    $favouriteDriver['vehicle_reg_no'] = $driverDetails[$value->driver_id]['vehicle_reg_no'];
                    $vehicleId = $driverDetails[$value->driver_id]['vehicle_category_id'];
                    if(isset($vehicleCategoryDetails[$vehicleId]))
                    {
                        $favouriteDriver['vehicle_name'] = $vehicleCategoryDetails[$vehicleId]['vehicle_name'];
                    } 
                    
                    array_push($result, $favouriteDriver);
                    
                }
            }
            

            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    =  $result;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for delete Favourite Driver from customer 
    # Request : Customer Id , driver Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    public function deleteFavouriteDriverList(Request $request)
    {
        $data = $request->all();
        $customerId = NULL;
        $driverId = NULL;
        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = array();
            return $response;
        }

        if(isset($data['driver_id']) && $data['driver_id'])
        {
            $driverId = $data['driver_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Driver id is required.";
            $response['data']    = array();
            return $response;
        }

        if($customerId && $driverId)
        {
            $favouriteDriver = array();
            $favouriteDriver['delete_flag'] = '1';
            $favouriteDriver['status'] = 'Declined';
            $favouriteDriver['notification_flag'] = '0';
            $favouriteDriver['updated_at'] = date('Y-m-d H:i:s');
            $affectedRow = FavouriteDriver::where('driver_id', $driverId)->where('customer_id', $customerId)->update($favouriteDriver);
            if($affectedRow > 0)
            {
                $response['success'] = true;
                $response['message'] = "Driver has been successfully removed from your Favourite Drivers.";
                $response['data']    = array();
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Driver can not be removed at the moment. Please try again later.";
                $response['data']    = array();
                return $response;
            }
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer id & Driver id required.";
            $response['data']    = array();
            return $response;
        }

    }

    # Function : This function used get Favourite Driver Details
    # Request : Driver Mg Code
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    public function getFavouriteDriverDetails(Request $request)
    {
        $data = $request->all();
        $driverId = NULL;
        $mgCode = NULL;
        $customerId = NULL;

        if(isset($data['mg_code']) && $data['mg_code'])
        {
            $mgCode = $data['mg_code'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "MgCode id required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        $mgCodeLength = strlen($mgCode);
        if($mgCodeLength < 6)
        {
            $mgcodeArray = explode('MG', $mgCode);
            $mgCodeInt = end($mgcodeArray);
            if(strlen($mgCodeInt) < 4)
            {
                $addZeroInMgCodeLength = 4 - strlen($mgCodeInt);
                if($addZeroInMgCodeLength == 1)
                {
                    $mgCode = 'MG0'.$mgCodeInt;
                }

                if($addZeroInMgCodeLength == 2)
                {
                    $mgCode = 'MG00'.$mgCodeInt;
                }

                if($addZeroInMgCodeLength == 3)
                {
                    $mgCode = 'MG000'.$mgCodeInt;
                }
            }
        }
        if($mgCode)
        {
            $customerDetails = Customer::select('id','city_id')->where('id', $customerId)->first();
            if($customerDetails == '')
            {
                $response['success'] = false;
                $response['message'] = "Customer not registered.";
                $response['data']    = (object) array();
                return $response;
            }
            $cityId = $customerDetails->city_id;
            $driverPrimeSetting = DriverPrimeSetting::where('city_id', $cityId)->first();
            if($driverPrimeSetting && $driverPrimeSetting->prime_allow_fav_driver == '1')
            {
                $driverDetails = Driver::where('mg_id','LIKE', $mgCode)->where('city_id', $cityId)->first();
                if($driverDetails == '')
                {
                    $response['success'] = false;
                    $response['message'] = "Invalid MG Code. Please enter a valid MG Code.";
                    $response['data']    = (object) array();
                    return $response;
                }
                if($driverDetails->is_prime == 0 )
                {
                    $response['success'] = false;
                    $response['message'] = "This MG code is currently not eligible to become a Favourite Driver.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            else
            {
                $driverDetails = Driver::where('mg_id','LIKE', $mgCode)->where('city_id', $cityId)->first();
            }

            if($driverDetails)
            {
                $driverInfo['mg_code'] = $driverDetails->mg_id;
                $driverInfo['id'] = $driverDetails->id;
                $driverInfo['driver_name'] = $driverDetails->driver_name;
                $driverInfo['vehicle_reg_no'] = $driverDetails->vehicle_reg_no;
                $vehicleId = $driverDetails->vehicle_category_id;
                $vehicleDetails = VehicleCategory::select('vehicle_name')->find($vehicleId);
                if($vehicleDetails)
                {
                    $driverInfo['vehicle_name'] = $vehicleDetails->vehicle_name;
                }
                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data'] = $driverInfo;
                return $response;

            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Invalid MG Code. Please enter a valid MG Code.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Invalid MG Code. Please enter a valid MG Code.";
            $response['data']    = (object) array();
            return $response;
        }

    }

    # Function : This function used Add Customer Booking Rate
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    public function customerLastBookingForRating(Request $request)
    {
        $data = $request->all();
        $response = array();
        if(isset($data['customer_id']) && $data['customer_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $customerId = $data['customer_id'];
        }
        
        $customerRatingId =  Rating::select('rating.booking_id','rating.user_id')
                                   ->join('booking', 'booking.id', '=', 'rating.booking_id')
                                   ->where('booking.customer_id', $customerId)
                                   ->where('rating.user_type','driver')
                                   ->get();

        $customerRatingIdArray = array();
        $lastBookingId = 0;
        $currentBookingId = 0;
        if(count($customerRatingId) > 0)
        {
            foreach ($customerRatingId as $key => $value) 
            {
                if($key == 0)
                {
                    $lastBookingId = $value->booking_id;
                }
                array_push($customerRatingIdArray, $value->booking_id);
            }
        }

        $getLastcompleteBooking =  Booking::select('booking.id','booking.customer_id','booking.driver_id','booking_customer_details.*','booking.vehicle_id')
                       ->join('booking_customer_details', 'booking_customer_details.booking_id', '=', 'booking.id')
                       ->where('booking.customer_id', $customerId)
                       ->orderBy('booking_customer_details.updated_at', 'desc')
                       ->where('booking_customer_details.customer_billing_status','1')
                       ->where('booking.driver_id','!=','0')
                       ->where('booking.driver_id','!=','-1')
                       ->first();
        
        if($getLastcompleteBooking != '')
        {
            $currentBookingId = $getLastcompleteBooking->booking_id;
            if(in_array($currentBookingId, $customerRatingIdArray))
            {
                $response['success'] = false;
                $response['message'] = "No Booking found.";
                $response['data']    = (object) array();
                return $response;
            }
            $getDriver = Driver::find($getLastcompleteBooking->driver_id);
            $getLastcompleteBooking->driver_name = $getDriver->driver_name;
            $getLastcompleteBooking->driver_number = $getDriver->driver_number; 
            $getLastcompleteBooking->vehicle_reg_no = $getDriver->vehicle_reg_no;
            $getLastcompleteBooking->bill = $getLastcompleteBooking->trip_charge + $getLastcompleteBooking->loading_charge + $getLastcompleteBooking->unloading_charge  +$getLastcompleteBooking->drop_points_charge + $getLastcompleteBooking->pod_charge + $getLastcompleteBooking->waiting_time_charge + $getLastcompleteBooking->actual_surge_charge -  $getLastcompleteBooking->estimate_discount_amount;
            $favoriteLocation = FavoriteLocation::where('booking_id',$currentBookingId)->first();
            if($favoriteLocation->pickup_landmark != '')
            {
                $getLastcompleteBooking->pickup_location = $favoriteLocation->pickup_landmark;
            }
            else
            {
                $getLastcompleteBooking->pickup_location = 'NA';
            }
            if($favoriteLocation->drop_landmark != '')
            {
                $getLastcompleteBooking->drop_location = $favoriteLocation->drop_landmark;
            }
            else
            {
                $getLastcompleteBooking->drop_location = 'NA';
            }
            $getVehicle = VehicleCategory::find($getLastcompleteBooking->vehicle_id);
            if($getVehicle->vehicle_name != '')
            {
                $getLastcompleteBooking->vehicle_name = $getVehicle->vehicle_name;
            }
            else
            {
                $getLastcompleteBooking->vehicle_name = 'NA';
            }
        }
        
        $ratingDetials = array();
        $ratingDetials = RatingReason::where('reason_type', 'customer')->get();
        if($ratingDetials != "")
        {

        }
        if($getLastcompleteBooking == '')
        {
            $response['success'] = false;
            $response['message'] = "No record found..";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $getLastcompleteBooking;
            $response['reason']  = $ratingDetials;
            return $response;
        }

    }

    # Function : This function used Add Customer Booking Rate
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar

    public function addCustomerBookingRating(Request $request)
    {
        $data = $request->all();
        $response = array();
        if(isset($data['booking_id']) && $data['booking_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $bookingId = $data['booking_id'];
        }

        if(isset($data['rating']) && $data['rating'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Rating is required.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $rating = $data['rating'];
        }

        if(isset($data['rating']) && $data['rating'] != '')
        {
            $description = $data['description'];
        }
        else
        {
            $description = '';
        }
        
        $checkBooking = Rating::where('booking_id',$bookingId)->where('user_type','driver')->first();
        if($checkBooking != '')
        {
            $response['success'] = false;
            $response['message'] = "This booking has already received ratings.";
            $response['data']    = (object) array();
            return $response;
        }
        $bookingDetails = Booking::select('driver_id')->find($bookingId);
        if($bookingDetails)
        {
            $ratingNew = new Rating;
            $ratingNew->user_id  = $bookingDetails->driver_id;
            $ratingNew->user_type = 'driver';
            $ratingNew->booking_id = $bookingId; 
            $ratingNew->rating     = $rating;
            $ratingNew->notes = $description;
            $ratingNew->created_at   = date('Y-m-d H:i:s');
            $ratingNew->updated_at   = date('Y-m-d H:i:s');
            $ratingNew->save();
            if($ratingNew == '')
            {
                $response['success'] = false;
                $response['message'] = "No record found.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $response['success'] = true;
                $response['message'] = "";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;
        }

    }

    # Function : This function used for get vehicle fav driver status
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    public function getVehicleFavouriteDriverStatus(Request $request)
    {
        $data = $request->all();
        $response = array();
        if(isset($data['customer_id']) && $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['vehicle_id']) && $data['vehicle_id'])
        {
            $vehicleId = $data['vehicle_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Vehicle Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        $vehicleDetails = VehicleCategory::find($vehicleId);
        if($vehicleDetails)
        {
            $customerFavouriteDrivers = FavouriteDriver::where('customer_id', $customerId)->where('status','Active')->where('delete_flag','0')->get();

            $favouriteDriverIds = array();
            foreach ($customerFavouriteDrivers as $key => $value) 
            {
                array_push($favouriteDriverIds, $value->driver_id);
            }

            $favouriteDriver = Driver::whereIn('id', $favouriteDriverIds)->where('vehicle_category_id', $vehicleId)->first();
            if($favouriteDriver)
            {
                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = (object) array();
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Looks like you haven't added any favourite drivers. Add a favourite driver from 'Manage Drivers' tab.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Vehicle not registered.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for get all configure booking
    # Request : Customer Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function getCustomerFixedBookings(Request $request)
    {
        $array      = array();
        $data       = $request->all();

        if (isset($data['customer_id'])) 
        {
            $customerId = $data['customer_id'];

            if ($customerId != "") 
            {
                $customer = Customer::where('id', $customerId)->first();
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Customer Id is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        
        if ($customer != "") 
        {
            $fixedBookingDetails = FixedBooking::where('customer_id', $customerId)->get();

            if (count($fixedBookingDetails) > 0) 
            {
                $vehicleIdsArray = array();
                $goodsIdsArray = array();
                foreach ($fixedBookingDetails as $key => $value) 
                {
                    array_push($vehicleIdsArray, $value->vehicle_id);
                    array_push($goodsIdsArray, $value->types_of_goods);
                }

                $vehicleDetails = VehicleCategory::whereIn('id', $vehicleIdsArray)->get()->keyBy('id');
                $typeOfGoods = GoodsType::whereIn('id', $goodsIdsArray)->get()->keyBy('id');
                $fixedBookingDetailsArray = array();
                foreach ($fixedBookingDetails as $key => $value) 
                {
                    if (isset($vehicleDetails[$value->vehicle_id])) 
                    {
                        $value->vehicle_name = $vehicleDetails[$value->vehicle_id]['vehicle_name'];
                    }
                    else
                    {
                        $value->vehicle_name = 'NA';
                    }

                    if (isset($typeOfGoods[$value->types_of_goods])) 
                    {
                        $value->goods_name = $typeOfGoods[$value->types_of_goods]['goods_name'];
                    }
                    else
                    {
                        $value->goods_name = 'NA';
                    }

                    if ($value->pod == 1 || $value->pod == "1") 
                    {
                        $value->pod = "Physical";
                    }
                    else
                    {
                        $value->pod = '';
                    }

                    if ($value->e_pod == 1 || $value->e_pod == "1") 
                    {
                        $value->e_pod = "Electronic";
                    }
                    else
                    {
                        $value->e_pod = '';
                    }

                    if ($value->covered_status == 1 || $value->covered_status == "1") 
                    {
                        $value->covered_status = "Covered";
                    }
                    else
                    {
                        $value->covered_status = 'Uncovered';
                    }

                    $value->multiple_drop_points = json_decode($value->multiple_drop_points, true);
                    $value->random_code = md5($value->created_at);
                    array_push($fixedBookingDetailsArray, $value);

                    
                }

                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = $fixedBookingDetailsArray;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Record not found.";
                $response['data']    =  array();
                return $response;
            }

        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer doesn't exist.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function used for add configure booking
    # Request : Customer Id , Fixed Booking Id
    # Response : Json message with fetch records
    # Autor : Vinod Kumar

    public function addCustomerFixedBooking(Request $request)
    {
        $data  = $request->all();
        $array = array();

        if (isset($data['customer_id'])) 
        {
            $customerId = $data['customer_id'];
            if ($customerId != "") 
            {
                $getCustomer = Customer::where('id', $customerId)->first();

                if($getCustomer->status == 'inactive')
                {
                    $response['success'] = false;
                    $response['message'] = "This user account has been temporarily suspended. Please contact MaalGaadi for further assistance.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Customer Id is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if (isset($data['fixed_booking_id'])) 
        {
            $fixedBookingId = $data['fixed_booking_id'];

            if ($fixedBookingId != "") 
            {
                $data = FixedBooking::where('id', $fixedBookingId)->where('customer_id', $customerId)->first();

            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Id is required.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Fixed Booking Id is required";
            $response['data']    = (object) array();
            return $response;
        }

        if ($data != "") 
        {
            $getBufferTime  = MaalgaadiSettings::where('city_id',$getCustomer->city_id)->first();
            if($getBufferTime != '')
            {
                $bufferTime = $getBufferTime->buffered_schedule_time;
            }
            else
            {
                $bufferTime = 5; 
            }
            $bufferScheduleTime = strtotime("+". $bufferTime ." minutes", strtotime(date('Y-m-d H:i:s')));
            $booking = new Booking;
            
            $booking->customer_id               = $data->customer_id;  
            $booking->employee_id               = 44;
            $booking->city_id                   = $getCustomer->city_id;
            $booking->vehicle_id                = $data->vehicle_id; 
            $booking->payment_option            = $data->payment_option;  
            $booking->payment_option            = $data->payment_option;  
            $booking->loading_required          = $data->loading_required;
            $booking->unloading_required        = $data->unloading_required;
            $booking->phy_pod_required          = $data->phy_pod_required; 
            $booking->e_pod_required            = $data->e_pod_required; 
            $booking->goods_id                  = $data->goods_id; 
            $booking->other_goods_text          = $data->other_goods_text;
            $booking->notes                     = $data->notes;
            $booking->favourite_driver_required = $data->favourite_driver_required; 
            $booking->navigation_required       = 0;
            $booking->customer_pricing_id       = $data->customer_pricing_id;
            $booking->driver_pricing_id         = $data->driver_pricing_id;
            $booking->current_status            = 'booked';
            $booking->covered_required          = $data->covered_required;
            $booking->configure_booking         = 1;
            
            $booking->trip_time                 = $data->estimated_trip_time_text;
            $booking->upper_trip_distance       = $data->trip_distance;
            $booking->estimate_upper_trip_distance  = $data->trip_distance;
            $booking->lower_trip_distance       = $data->lower_trip_distance;
            $booking->allotment_type            = $data->allotment_type;
            $booking->drop_points               = $data->drop_points;
            $booking->random_code               = md5($data->created_at);
            $booking->requirement_time          = date('Y-m-d H:i:s',$bufferScheduleTime);
            $booking->created_at                = date('Y-m-d H:i:s');
            $booking->save();
            
            $bookingID = $booking->id;
            
            $bookingStatus               = new BookingStatus;
            $bookingStatus->booking_id   = $booking->id;
            $bookingStatus->booking_time = date('Y-m-d H:i:s',$bufferScheduleTime);;
            $bookingStatus->save();
            
            $dropPoints = '';
            if(isset($data['multiple_drop_points']))
            { 
                $dropPoints = json_decode($data['multiple_drop_points'], true);
            }
            if($dropPoints != '')
            {
                foreach ($dropPoints as $key => $value) 
                {   
                    $multipleDropPoints                      =  new CustomerDropPoints;
                    $multipleDropPoints->customer_id         =  $customerId;
                    $multipleDropPoints->booking_id          =  $bookingID;
                    $multipleDropPoints->drop_landmark       =  $value['landmark'];
                    $multipleDropPoints->drop_lat            =  $value['latitute'];
                    $multipleDropPoints->drop_lng            =  $value['longitude'];
                    $multipleDropPoints->is_favourite        =  0;
                    $multipleDropPoints->save();   
                }
            }

            $favoriteLocation                      =  new FavoriteLocation;
            $favoriteLocation->employee_id         =  44;
            $favoriteLocation->booking_id          =  $bookingID;
            $favoriteLocation->customer_id         =  $customerId;
            $favoriteLocation->pickup_number       =  $data->pickup_number;
            $favoriteLocation->pickup_landmark     =  $data->pickup_landmark;
            $favoriteLocation->drop_landmark       =  $data->drop_landmark;
            $favoriteLocation->pickup_lat          =  $data->pickup_lat;
            $favoriteLocation->pickup_lng          =  $data->pickup_lng;
            $favoriteLocation->drop_lat            =  $data->drop_lat;
            $favoriteLocation->drop_lng            =  $data->drop_lng;
            $favoriteLocation->pickup_name         =  '';
            $favoriteLocation->pickup_organization =  '';
            $favoriteLocation->drop_name           =  '';
            $favoriteLocation->drop_organization   =  '';
            $favoriteLocation->is_favourite_pickup = 0;
            $favoriteLocation->is_favourite_drop   = 0;
            $favoriteLocation->save();
                
            $bookingCustomerDetails    = new BookingCustomerDetails;
            $bookingCustomerDetails->booking_id = $bookingID;
            $bookingCustomerDetails->trip_charge = $data->customer_trip_charge;
            $bookingCustomerDetails->estimate_upper_trip_charge = $data->customer_trip_charge;
            $bookingCustomerDetails->lower_trip_charge = $data->customer_lower_trip_charge;
            $bookingCustomerDetails->save(); 

            $bookingDriverDetails    = new BookingDriverDetails;
            $bookingDriverDetails->booking_id = $bookingID;
            $bookingDriverDetails->estimate_upper_trip_charge = $data->customer_trip_charge;
            $bookingDriverDetails->trip_charge = $data->driver_trip_charge;
            $bookingDriverDetails->lower_trip_charge = $data->driver_lower_trip_charge;
            $bookingDriverDetails->loading_charge = $data->driver_loading_charge;
            $bookingDriverDetails->unloading_charge = $data->driver_unloading_charge;
            $bookingDriverDetails->drop_points_charge = $data->driver_drop_points_charge;
            $bookingDriverDetails->save(); 

            $commonFunction = new CommonFunctionController;
            $allotedId = $commonFunction->addEmployeeAllotment($bookingID, 'booked');

            if($allotedId != '')
            {
                $allotedBooking = array();
                $allotedBooking['alloted_to_id'] = $allotedId;
                Booking::where('id', $booking->id)->update($allotedBooking);
            }
            else
            {
                $allotedBooking = array();
                $allotedBooking['alloted_to_id'] = 1;
                Booking::where('id', $booking->id)->update($allotedBooking);
            }
            

            $chekNextMin = strtotime(date("Y-m-d H:i:s", strtotime("+40 minutes")));
            if($bufferScheduleTime < $chekNextMin)
            {
                if(isset($data['favourite_driver_required']) && $data['favourite_driver_required'] == 1)
                {
                    $responseBoolean = $this->_checkFavDriverAvailable($booking->id); 
                    if($responseBoolean == true)
                    {
                        $checkBookingIsAlloted = '';
                        for ($i=0; $i < 8; $i++) 
                        { 
                            sleep(5);
                            $checkBookingIsAlloted = Booking::find($booking->id);
                            if($checkBookingIsAlloted->driver_id != 0)
                            {
                                break;
                            }
                        }
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            $responseArray['success'] = true;
                            $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                            $responseArray['data']    = array('responseCode' => 3 , 'booking_id' => $booking->id );
                        }
                        else
                        {
                            $responseArray['success'] = true;
                            $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                            $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );
                        }
                        
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 2 , 'booking_id' => $booking->id );

                    }
                    $data['booking_id'] = $booking->id;
                    $bookingDataArray = $this->getCustomerSingleBooking($data);
                    $responseArray['trip_data'] = $bookingDataArray;
                    return $responseArray;
                }
                else
                {
                    $responseBoolean = $this->_checkDriverAvailable($booking->id);
                    if($responseBoolean == true)
                    {
                        $checkBookingIsAlloted = '';
                        for ($i=0; $i < 8; $i++) 
                        { 
                            sleep(5);
                            $checkBookingIsAlloted = Booking::find($booking->id);
                            if($checkBookingIsAlloted->driver_id != 0)
                            {
                                break;
                            }
                        }
                        if($checkBookingIsAlloted->driver_id != 0)
                        {
                            $responseArray['success'] = true;
                            $responseArray['message'] = "We've found a driver for your booking! You could goto My Trips > Running Trips, to view further details.";
                            $responseArray['data']    = array('responseCode' => 1 , 'booking_id' => $booking->id );
                        }
                        else
                        {
                            $responseArray['success'] = true;
                            $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                            $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                        }
                    }
                    else
                    {
                        $responseArray['success'] = true;
                        $responseArray['message'] = "No drivers are availbale to accept your booking. We will notify you as soon as a driver is alloted to your booking";
                        $responseArray['data']    = array('responseCode' => 0 , 'booking_id' => $booking->id );
                    }
                    $data['booking_id'] = $booking->id;
                    $bookingDataArray = $this->getCustomerSingleBooking($data);
                    $responseArray['trip_data'] = $bookingDataArray;
                    return $responseArray;
                }
            }
            $data['booking_id'] = $booking->id;
            $bookingDataArray = $this->getCustomerSingleBooking($data);
            $response['success'] = true;
            $response['message'] = "You booking has been saved with us. We will notify you as soon as a driver is alloted on this booking.";
            $response['data']    = array('responseCode' => 4 , 'booking_id' => $booking->id );
            $response['trip_data'] = $bookingDataArray;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Data not found.";
            $response['data']    = (object) array();
            return $response;
        }
    }
     
    # Function : This function get All valid coupon code list
    # Request : All required parameter coupon code , customer Id, 
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    # Modify by : Brijendra
    public function promoCodeList(Request $request)
    {
        $data = $request->all();
        $response = array();
        
        if(isset($data['customer_id']) && $data['customer_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $customerId = $data['customer_id'];
        }
        
        $validFrom = date("Y-m-d H:i:s");
        $validTo   = date("Y-m-d H:i:s");
        $timeFrom  = date("H:i:s");
        $timeTo    = date("H:i:s");

        $customer = Customer::where('id', $customerId)->first();
        // $customerOrganization = $customer->cust_organization;
        $customerNumber = $customer->cust_number;

       //Applicable on first <n> completed booking(s)
        $todayDate = time();
        $customerSignupDate = strtotime($customer->created_at);
        $daysCount =  floor(($todayDate - $customerSignupDate)/ (60 * 60 * 24));

        $booking = Booking::select('id')->where('customer_id', $customerId)->get();
        $bookingIdsArray = array();
        foreach ($booking as $key => $value)
        {
            array_push($bookingIdsArray, $value->id);
        }

       $completedBookingCount = BookingStatus::whereIn('booking_id', $bookingIdsArray)->where('complete', '!=', '')->count();

       $discountCoupon = DiscountCouponCode::where('status',0)->orderBy('id', 'desc')->where('apply_on_number_of_booking', '!=', 0)
                                            ->where('city_id', $customer->city_id)->get();
        if ($discountCoupon != '')
        {
            $applyOnFirstNoOfBookingIdsArray = array();
            foreach ($discountCoupon as $key => $value)
            {
                if (($value->apply_on_number_of_booking > $completedBookingCount))
                {
                    if($value->apply_on_number_of_days == 0)
                    {
                        array_push($applyOnFirstNoOfBookingIdsArray, $value->id);
                    }

                   if($value->apply_on_number_of_days > 0 && $value->apply_on_number_of_days > $daysCount)
                    {
                        array_push($applyOnFirstNoOfBookingIdsArray, $value->id);
                    }
                }              
            }
        }
        
        $query = DiscountCouponCode::select('*');
        $query->where("valid_from","<=", $validFrom)->where("valid_to",">=", $validTo);
        $query->where('status', 0)->orderBy('id', 'desc')->where('apply_on_number_of_booking', 0);
        $couponCodeList = $query->get();

        $specificCustomerCouponIdsArray = array();
        $otherCouponIdsArray = array();
        $platform = 'web';
        foreach ($couponCodeList as $key => $value)
        {
            $applicableOn = json_decode($value->applicable_on);
               if (in_array($platform, $applicableOn))
               {
                   if ($value->customer_data != "" || $value->customer_data != NULL) 
                {
                    $customerData = json_decode($value->customer_data, true);

                    // if (in_array($customerOrganization, $customerData))
                    if (in_array($customerNumber, $customerData))
                    {
                        array_push($specificCustomerCouponIdsArray, $value->id);
                    }
                }

                if ($value->customer_data == "" || $value->customer_data == NULL) 
                {
                    array_push($otherCouponIdsArray, $value->id);
                }
            }
        }

        $finalIdsArray = array_merge($otherCouponIdsArray, $specificCustomerCouponIdsArray, $applyOnFirstNoOfBookingIdsArray);
        $couponCodeListArray = DiscountCouponCode::select('id','discount_code','description')->whereIn('id', $finalIdsArray)->orderBy('id', 'desc')->where('city_id', $customer->city_id)->get();

        if($couponCodeListArray == '')
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $couponCodeListArray;
            return $response;
        }
    }
    
    # Function : This function is used to check and validate coupon code
    # Request : All required parameter coupon code , customer Id, 
    # Response : Json message with fetch records
    # Autor : Vinod Kumar
    # Modify by : Brijendra
    public function checkPromoCode(Request $request)
    {
        $data = $request->all();
        $response = array();
        
        if(isset($data['discount_code']) && $data['discount_code'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Code is required.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $code = $data['discount_code'];
            $checkCouponCodeExist = DiscountCouponCode::where('discount_code', $code)->first();
            if ($checkCouponCodeExist == "") 
            {
                $response['success'] = false;
                $response['message'] = "Invalid coupon code.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        if(isset($data['customer_id']) && $data['customer_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $customerId = $data['customer_id'];
        }
        if(isset($data['vehicle_id']) && $data['vehicle_id'] != '')
        {
            $vehicleId = $data['vehicle_id'];
        }
        else
        {
            $vehicleId = 0;
        }

        if(isset($data['pickup_area_lat']) && $data['pickup_area_lat'] != '')
        {
            $pickupAreaLat = $data['pickup_area_lat'];
        }
        else
        {
            $pickupAreaLat = 0;
        }

        if(isset($data['pickup_area_lng']) && $data['pickup_area_lng'] != '')
        {
            $pickupAreaLng = $data['pickup_area_lng'];
        }
        else
        {
            $pickupAreaLng = 0;
        }

        if(isset($data['drop_area_lat']) && $data['drop_area_lat'] != '')
        {
            $dropAreaLat = $data['drop_area_lat'];
        }
        else
        {
            $dropAreaLat = 0;
        }

        if(isset($data['drop_area_lng']) && $data['drop_area_lng'] != '')
        {
            $dropAreaLng = $data['drop_area_lng'];
        }
        else
        {
            $dropAreaLng = 0;
        }
        if(isset($data['billing_type']) && $data['billing_type'] != '')
        {
            $billingType = $data['billing_type'];
        }
        else
        {
            $billingType = '';
        }
        if(isset($data['minimum_bill_amount']) && $data['minimum_bill_amount'] != '')
        {
            $bill = $data['minimum_bill_amount'];
        }
        else
        {
            $bill = 0;
        }
        $tripCharge = 0;
        if(isset($data['trip_charge']) && $data['trip_charge'] != '')
        {
            $tripCharge = $data['trip_charge'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['loading_charge']) && $data['loading_charge'] != '')
        {
            $loadingCharge = $data['loading_charge'];
        }
        else
        {
            $loadingCharge = 0;
        }

        if(isset($data['unloading_charge']) && $data['unloading_charge'] != '')
        {
            $unloadingCharge = $data['unloading_charge'];
        }
        else
        {
            $unloadingCharge = 0;
        }

        if(isset($data['drop_point_charge']) && $data['drop_point_charge'] != '')
        {
            $dropPointCharge = $data['drop_point_charge'];
        }
        else
        {
            $dropPointCharge = 0;
        }

        if(isset($data['pod_charge']) && $data['pod_charge'] != '')
        {
            $podCharge = $data['pod_charge'];
        }
        else
        {
            $podCharge = 0;
        }

        if(isset($data['surge_amount']) && $data['surge_amount'] != '')
        {
            $surge = $data['surge_amount'];
        }
        else
        {
            $surge = 0;
        }

        if(isset($data['lower_trip_charge']) && $data['lower_trip_charge'] != '')
        {
            $lowerTripCharge = $data['lower_trip_charge'];
        }
        else
        {
            $lowerTripCharge = $tripCharge;
        }

        if(isset($data['booking_schedule_time']) && $data['booking_schedule_time'] != '')
        {
            $bookingScheduleTime = $data['booking_schedule_time'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking schedule time is required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['platform']) && $data['platform'] != '')
        {
            $platform = $data['platform'];
        }
        else
        {
            $platform = 'app';
        }

        $totalTripCharge = $tripCharge + $loadingCharge + $unloadingCharge + $dropPointCharge + $podCharge + $surge;
        if($totalTripCharge < 0)
        {
            $totalTripCharge = 0;
        }
        $totalLowerTripCharge = $lowerTripCharge + $loadingCharge + $unloadingCharge + $dropPointCharge + $podCharge + $surge;
        if($totalLowerTripCharge < 0)
        {
            $totalLowerTripCharge = 0;
        }

        $validFrom = date("Y-m-d H:i:s",strtotime($bookingScheduleTime));
        $validTo   = date("Y-m-d H:i:s",strtotime($bookingScheduleTime));
        $customer  = Customer::select('cust_organization', 'city_id','cust_number')->where('id', $customerId)->first();
        $cityId    = $customer->city_id;
        // $customerOrganization = $customer->cust_organization;
        $customerNumber = $customer->cust_number; 
        

        if ($checkCouponCodeExist->apply_on_number_of_booking != 0) 
        {
            $codeData = DiscountCouponCode::where('discount_code',$code)->where('city_id', $cityId)->first();
        }
        else
        {
            $codeData = DiscountCouponCode::where("valid_from","<=",$validFrom)->where("valid_to",">=",$validTo)
                                          ->where('discount_code',$code)->where('city_id', $cityId)->first();
        }
        
        if(count($codeData) > 0)
        {
            if(isset($codeData->customer_data) && !empty($codeData->customer_data))
            {
                $customerData = json_decode($codeData->customer_data, true);

                // if (!in_array($customerOrganization, $customerData))
                if (!in_array($customerNumber, $customerData))
                {
                    $response['success'] = false;
                    $response['message'] = "Invalid coupon code.".$customerNumber;
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            
            if(isset($codeData->applicable_on) && $codeData->applicable_on != '')
            {
                $applicableOn = json_decode($codeData->applicable_on);
                if (!in_array($platform, $applicableOn) && count($applicableOn))
                {
                    $platformString  = array();
                    foreach ($applicableOn as $key => $value) {
                        if($value == 'app')
                        {
                            $platformString[] = 'application';
                        }
                        if($value == 'web')
                        {
                            $platformString[] = 'web panel';
                        }
                        if($value == 'callcentre')
                        {
                            $platformString[] = 'call center';
                        }
                    }
                    
                    $response['success'] = false;
                    $response['message'] = "Coupon code is applicable on bookings through ".implode(', ',$platformString)." only.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }

            if ($codeData->apply_on_number_of_booking == 0) 
            {
                $todayFrom = date('Y-m-d '.'00:00:00');
                $todayTo = date('Y-m-d '.'23:53:53');
                $maxUserPerDayData =  BookingDiscountCode::where("created_at",">=",$todayFrom)->where("created_at","<=",$todayTo)->where('discount_coupon_id',$codeData->id)->where('customer_id','!=',$customerId)->groupBy('customer_id')->get(); 
                $countMaxUserPerDay = count($maxUserPerDayData); 
                
                if($codeData->max_user_per_day <= $countMaxUserPerDay && $codeData->max_user_per_day != 0)
                {
                    $response['success'] = false;
                    $response['message'] = "Coupon code applicable on first ".$codeData->max_user_per_day." users only.";
                    $response['data']    = (object) array();
                    return $response;
                }
                
                $multipleUsePerDay =  BookingDiscountCode::where('discount_coupon_id',$codeData->id)->where("created_at",">=",$todayFrom)->where("created_at","<=",$todayTo)->where('customer_id',$customerId)->get();

                $checkBookingIdsArray = array();
                foreach ($multipleUsePerDay as $key => $value) 
                {
                    array_push($checkBookingIdsArray, $value->booking_id);
                }

                $removeCancelBooking = Booking::whereIn('id', $checkBookingIdsArray)->where('driver_id', '!=', '-1')->get();
                $withoutCancelBookingIdsArray = array();
                foreach ($removeCancelBooking as $key => $value) 
                {
                    array_push($withoutCancelBookingIdsArray, $value->id);
                }

                $multipleUsePerDay =  BookingDiscountCode::whereIn('booking_id', $withoutCancelBookingIdsArray)->where('discount_coupon_id',$codeData->id)->where("created_at",">=",$todayFrom)->where("created_at","<=",$todayTo)->where('customer_id',$customerId)->get();

                $countMultipleUsePerDay = count($multipleUsePerDay);
                if($codeData->multiple_use_per_day <= $countMultipleUsePerDay && $codeData->multiple_use_per_day != 0)
                {
                    if ($codeData->multiple_use_per_day == 1) 
                    {
                        $response['success'] = false;
                        $response['message'] = "Coupon code can only be used once a day.";
                        $response['data']    = (object) array();
                        return $response;
                    }
                    else
                    {
                        $response['success'] = false;
                        $response['message'] = "Coupon code can only be used ".$codeData->multiple_use_per_day." times a day.";
                        $response['data']    = (object) array();
                        return $response;
                    }
                }

                if ($codeData->max_limit_to_use != 0) 
                {
                    $couponMaxLimitToUse =  BookingDiscountCode::whereIn('booking_id', $withoutCancelBookingIdsArray)->where('discount_coupon_id',$codeData->id)->where("created_at",">=", $codeData->valid_from)->where("created_at","<=",$codeData->valid_to)->where('customer_id',$customerId)->get();

                    $countCouponMaxLimitUse = count($couponMaxLimitToUse);
                    if($codeData->max_limit_to_use <= $countCouponMaxLimitUse && $codeData->max_limit_to_use != 0)
                    {                       
                        $response['success'] = false;
                        $response['message'] = "This coupon code has expired.";
                        $response['data']    = (object) array();
                        return $response;
                    }
                }
            }
            else
            {

                $todayDate          = strtotime($bookingScheduleTime);
                $customerSignupDate = strtotime($customer->created_at);
                $daysCount          =  floor(($todayDate - $customerSignupDate)/ (60 * 60 * 24));

                $booking         = Booking::select('id')->where('customer_id', $customerId)->get();
                $bookingIdsArray = array();
                foreach ($booking as $key => $value) 
                {
                    array_push($bookingIdsArray, $value->id);
                }

                $completedBookingCount = BookingStatus::whereIn('booking_id', $bookingIdsArray)->where('complete', '!=', '')->count();

                if ($codeData->apply_on_number_of_booking <= $completedBookingCount) 
                {
                    $response['success'] = false;
                    $response['message'] = "This coupon code has expired.";
                    $response['data']    = (object) array();
                    return $response;
                } 

                if ($codeData->apply_on_number_of_days <= $daysCount && $codeData->apply_on_number_of_days != 0)
                {
                    $response['success'] = false;
                    $response['message'] = "This coupon code has expired.";
                    $response['data']    = (object) array();
                    return $response;
                }

            }


            if( $totalTripCharge < $codeData->minimum_bill_amount)
            {
                $response['success'] = false;
                $response['message'] = "Coupon code is applicable on a minimum bill of ".$codeData->minimum_bill_amount;
                $response['data']    = (object) array();
                return $response;
            }

            if(isset($codeData->vehicle_id) && !empty($codeData->vehicle_id))
            {
                $vehicleIdsArray = json_decode($codeData->vehicle_id, true);

                if (!in_array($vehicleId, $vehicleIdsArray))
                {
                    $vehicleData = VehicleCategory::select('vehicle_name')->whereIn('id', $vehicleIdsArray)->get();

                    $vehicleNamesArray = array();
                    foreach ($vehicleData as $key => $value) 
                    {
                        array_push($vehicleNamesArray, $value->vehicle_name);
                    }
                    
                    $response['success'] = false;
                    $response['message'] = "Coupon code is applicable only on  ".implode(', ',$vehicleNamesArray);
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            
            if(isset($codeData->pickup_radius) && $codeData->pickup_radius != 0 && $pickupAreaLat != 0 && $pickupAreaLng != 0 && $codeData->pickup_area_lat != 0 && $codeData->pickup_area_lng != 0)
            {
                $auto = new AutoAllotBookingController;
                $radius = $auto->getRadiantdistance($pickupAreaLat, $pickupAreaLng, $codeData->pickup_area_lat, $codeData->pickup_area_lng);
                $radiusKm = $radius/1000;
                if($codeData->pickup_radius < $radiusKm )
                {
                    $response['success'] = false;
                    $response['message'] = "Coupon code is not applicable on bookings from selected area.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }
            
            if ($billingType != 'hourly') 
            {
                if(isset($codeData->drop_radius) && $codeData->drop_radius != 0 && $dropAreaLat != 0 && $dropAreaLng != 0 && $codeData->drop_area_lat != 0 && $codeData->drop_area_lng != 0)
                {

                    $auto = new AutoAllotBookingController;
                    $radius = $auto->getRadiantdistance($dropAreaLat, $dropAreaLng, $codeData->drop_area_lat, $codeData->drop_area_lng);
                    $radiusKm = $radius/1000;
                    if($codeData->drop_radius < $radiusKm )
                    {
                        $response['success'] = false;
                        $response['message'] = "Coupon code is not applicable on bookings to the selected area.";
                        $response['data']    = (object) array();
                        return $response;
                    }
                }
            }
            
            $billingTypeArray = json_decode($codeData->billing_type);
            if(count($billingTypeArray) > 0)
            {
                if (!in_array($billingType, $billingTypeArray))
                {
                    $response['success'] = false;
                    $response['message'] = "Coupon code is not applicable on ".$billingType." bookings";
                    $response['data']    = (object) array();
                    return $response;
                }
            }

            if(isset($codeData->time_from) && isset($codeData->time_to) && ($codeData->time_to != 0) && ($codeData->apply_on_number_of_booking == 0))
            {
                $scheduleDay = date('Y-m-d',strtotime($bookingScheduleTime));
                $timeTo      = $scheduleDay.' '.$codeData->time_to;
                $timeTo      = strtotime($timeTo);
                $timeFrom    = $scheduleDay.' '.$codeData->time_from;
                $timeFrom    = strtotime($timeFrom);
                $currentTime = date('Y-m-d H:i:s',strtotime($bookingScheduleTime));
                $currentTime = strtotime($bookingScheduleTime);
                if($timeFrom > $currentTime)
                {
                    $response['success'] = false;
                    $response['message'] = "Coupon code is not valid anymore.";
                    $response['data']    = (object) array();
                    return $response;
                }
                if($currentTime > $timeTo && $timeFrom < $currentTime)
                {
                    $response['success'] = false;
                    $response['message'] = "Coupon code is not valid anymore.";
                    $response['data']    = (object) array();
                    return $response;
                }
            }

            $dayOfWeekArray = json_decode($codeData->day_of_week);
            if(count($dayOfWeekArray) > 0)
            {
                $day = strtolower(date('l')); 
                $day = substr($day, 0, 3);
                if (!in_array($day, $dayOfWeekArray))
                {
                    $daysOfWeekString = array();
                    foreach ($dayOfWeekArray as $key => $value) 
                    {
                        if($value == 'mon')
                        {
                            $daysOfWeekString[] = 'Monday ';
                        }
                        if($value == 'tue')
                        {
                            $daysOfWeekString[] = 'Tuesday ';
                        }
                        if($value == 'wed')
                        {
                            $daysOfWeekString[] = 'Wednesday ';
                        }
                        if($value == 'thu')
                        {
                            $daysOfWeekString[] = 'Thursday ';
                        }
                        if($value == 'fri')
                        {
                            $daysOfWeekString[] = 'Friday ';
                        }
                        if($value == 'sat')
                        {
                            $daysOfWeekString[] = 'Saturday ';
                        }
                        if($value == 'sun')
                        {
                            $daysOfWeekString[] = 'Sunday ';
                        }
                    }
                    $response['success'] = false;
                    $response['message'] = "Coupon code is only applicable on ".implode(', ',$daysOfWeekString) .".";
                    $response['data']    = (object) array();
                    return $response;
                }
            }

            if($codeData->status == 1)
            {
                $response['success'] = false;
                $response['message'] = "Sorry, this coupon code has expired.";
                $response['data']    = (object) array();
                return $response;
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Sorry, this coupon code has expired.";
            $response['data']    = (object) array();
            return $response;
        }
        $discountAmount = 0;
        if($codeData->type == 'cashback')
        {   
            if($codeData->discount_type == 'flat')
            {
                $cashbackAmount = $codeData->discount_amount;   
                $discountPercentage = 0;
            }
            if($codeData->discount_type == 'percentage')
            {
                $discountPercentage = $codeData->discount_percent;
                $cashbackAmount =  round($totalTripCharge * $discountPercentage / 100);
                $maxDiscountLimit = $codeData->discount_max_amount;
                if($maxDiscountLimit < $cashbackAmount)
                {
                    $cashbackAmount = $maxDiscountLimit;
                    $discountPercentage = (($cashbackAmount * 100) / $totalTripCharge);
                    if(is_float($discountPercentage))
                    {
                        $discountPercentage = number_format($discountPercentage, 1, '.', '');
                    }
                }
            }
            $finalBill = $totalTripCharge;
        }
        else
        {
            if($codeData->discount_type == 'flat')
            {
                $discountAmount = $codeData->discount_amount;   
                $discountPercentage = 0;
            }
            if($codeData->discount_type == 'percentage')
            {
                $discountPercentage = $codeData->discount_percent;
                $discountAmount =  round($totalTripCharge * $discountPercentage / 100);
                $maxDiscountLimit = $codeData->discount_max_amount;
                if($maxDiscountLimit < $discountAmount)
                {
                    $discountAmount = $maxDiscountLimit;
                    $discountPercentage = (($discountAmount * 100) / $totalTripCharge);
                    if(is_float($discountPercentage))
                    {
                        $discountPercentage = number_format($discountPercentage, 1, '.', '');
                    }
                }
            }
            $finalBill = $totalTripCharge - $discountAmount;
            $cashbackAmount = 0;
        }
        $finalTripAmount = $totalTripCharge - $discountAmount;
        if(isset($data['tip']))
        {
            $finalTripAmount = $finalTripAmount + $data['tip'];
        }
        if($finalTripAmount < 0)
        {
            $finalTripAmount = 0;
        }

        $lowerFinalTripAmount = $totalLowerTripCharge - $discountAmount;

        if(isset($data['tip']))
        {
            $lowerFinalTripAmount = $lowerFinalTripAmount + $data['tip'];
        }

        if($lowerFinalTripAmount < 0)
        {
            $lowerFinalTripAmount = 0;
        }
        
        if(isset($data['final_amount']) && $data['final_amount'] != '')
        {
            $payDriver =  $data['final_amount'] - $discountAmount;
        }
        else
        {
            $payDriver =  $finalTripAmount;
        }
        if($payDriver < 0)
        {
            $payDriver = 0;
        }

        $isDiscount = true;
        if($cashbackAmount > 0)
        {
            $isDiscount = false;
        }

        $dataArray = array(
                        'discount_code_id' => $codeData->id,
                        'loading_charge' => $loadingCharge,
                        'unloading_charge' => $unloadingCharge,
                        'drop_point_charge' => $dropPointCharge,
                        'pod_charge' => $podCharge,
                        'surge_amount' => $surge,
                        'discount_amount' => $discountAmount,
                        'cashback_amount' => $cashbackAmount,
                        'is_discount' => $isDiscount,
                        'final_amount' => ceil($payDriver / 10) * 10,
                        'upper_estimated_bill' => $finalTripAmount,
                        'lower_estimated_bill' => $lowerFinalTripAmount
                    );

        $response['success'] = true;
        $response['message'] = "Coupon code applied successfully.";
        $response['data']    = $dataArray;
        return $response;
    }

    # Function : This function is used get all Free driver 
    # Request : none
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    public function getFreeDriversLocation()
    {
        $freeDriver     = DriverRegular::select('driver_id', 'lat', 'lng')->where('status', 'free')->get();        
        $driverIdsArray = array();
        foreach ($freeDriver as $key => $value) 
        {
            array_push($driverIdsArray, $value->driver_id);
        }
        $driverDetails = Driver::whereIn('id', $driverIdsArray)->get()->keyBy('id')->toArray();
        foreach ($freeDriver as $key => $value) 
        {
            if(isset($driverDetails[$value->driver_id]))
            {
                $value->vehicle_category_id = $driverDetails[$value->driver_id]['vehicle_category_id'];
            }
            else
            {
                $value->vehicle_category_id = 1;
            }
            $value->covered = false;
            $value->loading_services = false;
            $loginDriver = DriverDetials::where('driver_id',$value->driver_id)->orderBy('created_at','DESC')->first();
            if($loginDriver != '')
            {
                if($loginDriver->covered_status == 'yes')
                {
                    $value->covered = true;
                }
                if($loginDriver->loading_unloading_status == 'yes')
                {
                    $value->loading_services = true;
                }
                if($loginDriver->lat != '')
                {
                    $value->lat = $loginDriver->lat;
                }
                if($loginDriver->lng != '')
                {
                    $value->lng = $loginDriver->lng;
                }
            }
            
        }
        if($freeDriver != "")
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $freeDriver;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;
        }
        
    }

    # Function : This function is  used get all Error Messages 
    # Request : none
    # Response : Json message with fetch records
    # Autor : Rahul Patidar
    # ModifyBy : Vinod Kumar 
    public function getCustomerErrorMessage()
    {
        $errorMessages = ErrorMessages::where('type','customer')->get();
        if($errorMessages  != '')
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $errorMessages;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Record not found.";
            $response['data']    = (object) array();
            return $response;
        }
        
    }

    # Function : This function is  used Delete booking after Add Booking 
    # Request : Random Code
    # Response : Json message
    # Autor : Vinod Kumar
    public function deleteCustomerBooking(Request $request)
    {
        $data  = $request->all();
        $randomCode = $data['random_code'];
        $eveteTypeArray = array('NEW','RE_BOOK');
        $getBooking = Booking::where('random_code',$data['random_code'])->where('driver_id','0')->first();
        
        if($getBooking != '')
        {
            // $bookingId = $getBooking->id;
            // $getBooking->delete();
            // $bookingCustomerDetails = BookingCustomerDetails::where('booking_id',$bookingId)->first();
            // if($bookingCustomerDetails != '')
            // {
            //     $bookingCustomerDetails->delete();
            // }
            // $bookingDriverDetails = BookingDriverDetails::where('booking_id',$bookingId)->first();
            // if($bookingDriverDetails != '')
            // {
            //     $bookingDriverDetails->delete();
            // }

            // $customerDropPoints = CustomerDropPoints::where('booking_id',$bookingId)->first();
            // if($customerDropPoints != '')
            // {
            //     $customerDropPoints->delete();
            // }

            // $bookingDiscountCode = BookingDiscountCode::where('booking_id',$bookingId)->first();
            // if($bookingDiscountCode != '')
            // {
            //     $bookingDiscountCode->delete();
            // }
            // $favoriteLocation = FavoriteLocation::where('booking_id',$bookingId)->first();
            // if($favoriteLocation != '')
            // {
            //     $favoriteLocation->delete();
            // }
            // $bookingStatus = BookingStatus::where('booking_id',$bookingId)->first();
            // if($bookingStatus != '')
            // {
            //     $bookingStatus->delete();
            // }
            $bookingstatus = BookingStatus::where('booking_id',$getBooking->id)->orderBy('id','desc')->first();
            $canceldate                   = date("Y-m-d H:i:s");
            $bookingstatus->cancel_time   = $canceldate;
            $bookingstatus->save();
            $getBooking->driver_id           = '-1';       
            $getBooking->save();
            $deletedRows = EmployeeAllotment::where('booking_id',$getBooking->id)->delete();
            $cancelBooking = new CancelBooking;
            $cancelBooking->employee_id = "44";
            $cancelBooking->booking_id  = $getBooking->id;
            $cancelBooking->reason      = 'OD vehicle not available';
            $cancelBooking->issues_type = 'AvailabilityOD';
            $cancelBooking->action      = 'Scrapped Off';
            $cancelBooking->created_at  = date("Y-m-d H:i:s");
            $cancelBooking->updated_at  = date("Y-m-d H:i:s");
            $cancelBooking->save();
            $response['success'] = true;
            $response['message'] = "Booking has been cancelled successfully.";
            $response['data']    = (object) array();
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking already alloted to drive.";
            $response['data']    = array('responseCode' => 1);
            return $response;
        }
    }

    # Function : This function is  used Delete booking after Add Booking 
    # Request : Random Code
    # Response : Json message
    # Autor : Vinod Kumar
    public function getCustomerBookingSetting(Request $request)
    {
        $data  = $request->all();
        if(isset($data['customer_id']) && $data['customer_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $customerId = $data['customer_id'];
        $getCustomer = Customer::find($customerId);
        if($getCustomer != '')
        {
            $getSetting = MaalgaadiSettings::select('buffered_schedule_time','allowed_drop_point','max_allow_distance','customer_allowed_favourite_driver','max_tip_charge','app_allow_tab','customer_care_contact')->where('city_id',$getCustomer->city_id)->first();
            $getSettingApp = json_decode($getSetting->app_allow_tab,true);
            $fixedBookingCount = FixedBooking::where('customer_id', $customerId)->count();
            $getSetting->app_allow_tab = $getSettingApp[0];
            $getSetting->fixed_booking_count = $fixedBookingCount;
            $getSetting->tip_array = $this->_getTipCharges($getCustomer->city_id);
            $getSetting->waiting_array = $this->_getBookingWaitingTimeRange($getCustomer->city_id);
            //$getSetting->tip_array = array(10, 20, 30, 40, 50);
            // $getSetting->waiting_array = array(0.5, 1, 1.5, 2, 3, 4, 5);
            $getSetting->trip_frequency = array('5 trips a month','30 trips a month','60 trips a month','More than 60 trips');
            $getSetting->customer_care_number = $getSetting->customer_care_contact;
            $getCity = City::get();
            $getSetting->city_list = $getCity;
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $getSetting;
            return $response;
        }
        else
        {
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = array('buffered_schedule_time' => 30 , 'allowed_drop_point' => 5, 'max_allow_distance' => 80);
            return $response;
        }
    }

    # Function : This function is  used get Promotional notification
    # Request : Random Code
    # Response : Json message
    # Autor : Rahul Patidar
    public function getPromotionalNotification(Request $request)
    {
        $data  = $request->all();
        if(isset($data['customer_id']) && $data['customer_id'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $customerId = $data['customer_id'];
        $getCustomer = Customer::find($customerId);
        if($getCustomer != '')
        {
            $date = (date("Y-m-d H:i:s", strtotime("-7 day")));
            $getSetting = CustomerNotification::select('id','message','image','created_at')->where('created_at','>=',$date)->where('city_id',$getCustomer->city_id)->orderBy('created_at','desc')->get();
            $response['success'] = true;
            $response['message'] = "Record found.";
            $response['data']    = $getSetting;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Invalid customer Id.";
            $response['data']    = $getSetting;
            return $response;
        }
    }

    # Function : This function is  used get Promotional notification
    # Request : Random Code
    # Response : Json message
    # Autor : Rahul Patidar
    public function removePromotionalNotification(Request $request)
    {
        //$data  = $request->all();
        $rawData = file_get_contents("php://input");
        $data = (array) json_decode($rawData);

        if(isset($data['idsArray']) && $data['idsArray'] == '')
        {
            $response['success'] = false;
            $response['message'] = "Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        $idsArray = json_decode($data['idsArray']);
        if($data['idsArray'] != '')
        {
            foreach ($idsArray as $key => $value) 
            {
                $getSetting = CustomerNotification::where('id',$value)->delete();
            }
            $response['success'] = true;
            $response['message'] = "Record has been delete.";
            $response['data']    = (object) array();;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Invalid customer Id.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    # Function : This function is  used Get issues and Sub Issues
    # Request : Customer Id
    # Response : Json message
    # Autor : Vinod Kumar
    public function getCustomerComplaint(Request $request)
    {
        $data  = $request->all();
        if(isset($data['customer_id']))
        {
            $customerId = $data['customer_id'];
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
       
        $complainTypeDetials =ComplaintType::select('id','complaint_type','priority')->orderBy(DB::raw("coalesce(priority = 0)","ASC"))->orderBy('priority','ASC')->get();
        $complainTypeIdsArray = array();
        if(!empty($complainTypeDetials))
        {
            foreach ($complainTypeDetials as $key => $value)
            {
                array_push($complainTypeIdsArray, $value->id);
            }

            $driverSubComplain = SubComplaintType::select('id','parent_complain_id','sub_complaint','description_text','help_text','priority','created_at','updated_at')->WhereIn('parent_complain_id', $complainTypeIdsArray)->orderBy(DB::raw("coalesce(priority = 0)","ASC"))->orderBy('priority','ASC')->get();
           
            $driverSubComplainArray = array();
            $subComplainTypeIdArray = array();
            if(!empty($driverSubComplain))
            {
                foreach ($driverSubComplain as $key => $value)
                {
                    $driverSubComplainArray[$key][$value->parent_complain_id] = $value->toArray(); 
                    array_push($subComplainTypeIdArray, $value->parent_complain_id);
                }
            }
 
            $subArrayResult = array();
            foreach ($complainTypeDetials as $key => $value)
            {
                for ($i=0; $i < count($driverSubComplain) ; $i++)
                { 
                    if(in_array($value->id, $subComplainTypeIdArray))
                    {
                        if(array_key_exists($value->id,$driverSubComplainArray[$i]))
                        {
                            $subArrayResult[$i] = $driverSubComplainArray[$i][$value->id];
                            $subArrayResult[$i]['created_at']= date('d-m-Y H:i:s',strtotime($driverSubComplainArray[$i][$value->id]['created_at']));

                            $subArrayResult[$i]['updated_at']= date('d-m-Y H:i:s',strtotime($driverSubComplainArray[$i][$value->id]['updated_at']));
                        }
                    }
                }
                $complainTypeDetials[$key]['sub_issue'] = array_values($subArrayResult);
                $subArrayResult = array();
            }
        }

        if($complainTypeDetials != "") 
        {
            $response['success'] = true;
            $response['message'] = "Record found..";
            $response['data']    = $complainTypeDetials;
            return $response;
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    
    # Function : This function is  used for add Customer Issues
    # Request : Complaint Data
    # Response : Json message
    # Autor : Vinod Kumar
    public function addComplaint(Request $request)
    {
        $data = $request->all();
        $result = array();
        $complaint = new Complaint();
        if(isset($data['customer_id']))
        {
            $complaint->customer_id = $data['customer_id'];
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;
        }
        if(isset($data['booking_id']))
        {
            $complaint->trip_id = $data['booking_id'];
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Booking Id is required";
            $response['data']    = (object) array();
            return $response;
        }
        
        if(isset($data['complaint_type_id']))
        {
            $complaint->complaint_type_id = $data['complaint_type_id'];
        } 
        else
        {
            $response['success'] = false;
            $response['message'] = "Issue type required.";
            $response['data']    = (object) array();
            return $response;
        }

        if(isset($data['sub_complaint_type_id']))
        {
             $complaint->sub_complaint_type_id = $data['sub_complaint_type_id'];
        }
        else
        {
             $complaint->sub_complaint_type_id = '';
        }

        $reason=trim($data['reason']);
        $checkComplaint = Complaint::where('customer_id',$data['customer_id'])->where('complaint_type_id',$data['complaint_type_id'])->where('sub_complaint_type_id',$data['sub_complaint_type_id'])->where('reason',$reason)->first();
        if(count($checkComplaint))
        {
            $response['success'] = true;
            $response['message'] = "We have received your issue. You will be notified as soon as the issue is resolved.";
            $response['data']    = (object) array();
            return $response;
        }
        
        $complaint->reason = $data['reason'];

        $booking = Booking::find($data['booking_id']);
        if(!empty($booking))
        {
            $complaint->driver_id = $booking->driver_id;
        }

        $complaint->created_at = date("Y-m-d H:i:s");
        $complaint->updated_at = date("Y-m-d H:i:s");
        $resultComplaint =  $complaint->save();
        $complaint['complaint_id'] = $complaint->id;

        if($resultComplaint != "")
        {
            $response['success'] = true;
            $response['message'] = "We have received your issue. You will be notified as soon as the issue is resolved.";
            $response['data']    = $complaint;
            return $response;
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Issue already registered.";
            $response['data']    = (object) array();
            return $response;
        }
    }

    
    # Function : This function is  used for add Customer Issues
    # Request : Complaint Data
    # Response : Json message
    # Autor : Vinod Kumar
    public function sendTestNotification(Request $request)
    {
        $data = $request->all();
        $response = array();
        $convertText = new TranslateClient();
        $convertText->setSource('en');
        $convertText->setTarget('hi');

        echo $convertText->translate("best price");
    }


    # Function : This function is  used for get Booking Route which is followed by Driver
    # Request : Booking Id
    # Response : Json message
    # Autor : Vinod Kumar
    public function getRouteTrip(Request $request)
    {
        $data        = $request->all();
        $bookingId   = NULL;
        $resultArray = array();
        if(isset($data['booking_id']))
        {
            $bookingId    = $data['booking_id'];
            $booking      = Booking::find($bookingId);
            
            $driverRoutes = DriverRoute::where('booking_id', $bookingId)->first();
            $driverRoutesArray = array();
            if($driverRoutes != '')
            {
                $routes = $driverRoutes->routes;
                $routes = json_decode($routes,true);
                $dtcRoutes = $driverRoutes->dtc_routes;
                $dtcRoutes = json_decode($dtcRoutes,true);
                $driverRoutesArray['booking_id'] = $driverRoutes->booking_id;
                $driverRoutesArray['routes'] = $routes;
                $driverRoutesArray['dtc_routes'] = $dtcRoutes;
            }

            if($driverRoutes != "")
            {
                $response['success'] = true;
                $response['message'] = "Record found..";
                $response['data']    = $driverRoutesArray;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "No record found.";
                $response['data']    = (object) array();
                return $response;  
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "No record found.";
            $response['data']    = (object) array();
            return $response; 
        }
    }
    # Function : This function is  used for get Customer Avg Rating
    # Request : Booking Id
    # Response : Json message
    # Autor : Ankur 
    public function _getCustomerAverageRating($customerId)
    {
        $ratingDetails = AverageRating::select('average_rating')->where('user_id', $customerId)->where('user_type', 'customer')->first();
        $rating        = 5;
        if($ratingDetails != "")
        {
            if($ratingDetails->average_rating != "")
            {
                $rating = $ratingDetails->average_rating;    
            }
            else
            {
                $rating = 5;       
            }
            
        }
        return $rating;
    }    
    
    # Function : This function is  used for get Tip Charge 
    # Request : City Id
    # Response : Json message
    # Autor : Vinod 
    public function _getTipCharges($cityId)
    {
        $getVehicle = VehicleCategory::select('id')->where('city_id',$cityId)->where('delete_status',0)->get();
        if($getVehicle != '')
        {
            $vehicleIds = array();
            foreach ($getVehicle as $key => $value) 
            {
                $tipList = array();
                $value->tip_list = array();
                $getTip = TipCharge::select('tip')->where('vehicle_id',$value->id)->get();
                $value->vehicle_id = $value->id;
                foreach ($getTip as $key => $val) 
                {
                     array_push($tipList, $val->tip);
                     $value->tip_list = $tipList;
                }
                unset($value->id);
            }
        }
        return $getVehicle;
    }

    # Function : This function is  used for get booking waiting time range 
    # Request : City Id
    # Response : Json message
    # Autor : Brijendra 
    public function _getBookingWaitingTimeRange($cityId)
    {
        $getVehicle = VehicleCategory::select('id')->where('city_id',$cityId)->where('delete_status',0)->get();
        if($getVehicle != '')
        {
            $vehicleIds = array();
            foreach ($getVehicle as $key => $value) 
            {
                $watingTimeList  = array();
                $value->waiting_list = array();

                $getWaitingTime = BookingWaitTimeRange::select('time_in_hour')->where('vehicle_id', $value->id)->get();
                $value->vehicle_id = $value->id;

                foreach ($getWaitingTime as $key => $val) 
                {
                     array_push($watingTimeList, $val->time_in_hour);
                     $value->waiting_list = $watingTimeList;
                }
                unset($value->id);
            }
        }
        return $getVehicle;
    }

    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 
    public function successPaymentResponseFromCCAPI(Request $request)
    {
        $data = $request->all();
        if(isset($data['encResp']))
        {
            $workingKey    = '896647E43146FFE56E6D67E74304298F'; // live 
            //$workingKey    = '9469F8B0DF062D23371B10E12F1D8B48'; // test 
            $encResponse   = $data["encResp"];         
            $rcvdString    = $this->decrypt($encResponse,$workingKey);
            $orderStatus   = "";
            $decryptValues = explode('&', $rcvdString);
            $dataSize      = sizeof($decryptValues);
            
            for($i = 0; $i < $dataSize; $i++) 
            {
                $information = explode('=',$decryptValues[$i]);
                
                if($i==3)   $orderStatus=$information[1];
            }
            if($orderStatus === "Success")
            {
                $response['success'] = true;
                $response['message'] = "Your transaction has been successfully processed. The amount will be reflected in your MaalGaadi account within 24 hours. Please save the transaction number for future references.";
                $response['data']    = $data;
                return $response;
                
            }
            else if($orderStatus === "Aborted")
            {
                $response['success'] = false;
                $response['message'] = "Oops! We were unable to process your transaction. Please try again after sometime. If, the problem persists, please contact your bank.";
                $response['data']    = $data;
                return $response; 
            }
            else if($orderStatus === "Failure")
            {
                $response['success'] = false;
                $response['message'] = "Oops! We were unable to process your transaction. Please try again after sometime. If, the problem persists, please contact your bank.";
                $response['data']    = $data;
                return $response; 
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Oops! We were unable to process your transaction. Please try again after sometime. If, the problem persists, please contact your bank.";
                $response['data']    = $data;
                return $response; 
            }
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Oops! We were unable to process your transaction. Please try again after sometime. If, the problem persists, please contact your bank.";
            $response['data']    = (object) array();
            return $response; 
        }
    }
    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 
    public function cancelPaymentResponseFromCCAPI(Request $request)
    {
        $data = $request->all();
        if(isset($data['encResp']))
        {
            $response['success'] = false;
            $response['message'] = "Transaction cancelled.";
            $response['data']    = $data;
            return $response; 
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Transaction failed.";
            $response['data']    = (object) array();
            return $response; 
        }
    }
    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 
    public function successPaymentResponse(Request $request)
    {
        $data = $request->all();
        
        if(isset($data['order_id']))
        {
            $orderId = $data['order_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Order Id is required.";
            $response['data']    = (object) array();
            return $response;  
        }
        if(isset($data['amount']))
        {
            $amountReceived = $data['amount'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Amount is required.";
            $response['data']    = (object) array();
            return $response;  
        }
        if(isset($data['encResp']))
        {
            $encResp = $data['encResp'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Response Id is required.";
            $response['data']    = (object) array();
            return $response;  
        }
        if(isset($data['customer_id']))
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id is required.";
            $response['data']    = (object) array();
            return $response;  
        }
        if(isset($data['status']) && $data['status'] == 'true')
        {
            $status = 1;
        }
        else
        {
            $status = 0;
        }
        
        $getCustomer = Customer::find($customerId);
        $customerWallet = CustomerLedger::where('customer_id', $customerId)->orderBy('id', 'desc')->first();

        $checkOrder = CustomerOrder::where('order_id',$orderId)->first();
        if($checkOrder == '')
        {
            $order = new CustomerOrder;
            $order->customer_id = $customerId;
            $order->order_id = $orderId;
            $order->amount = $amountReceived;
            $order->encResp = $encResp;
            $order->status = $status;
            $order->created_at = date("Y-m-d H:i:s");
            $order->save();
            $getLastOrder = CustomerOrder::where('customer_id',$customerId)->orderBy('id', 'desc')->first();
            if($status == 1)
            {
                if($customerWallet != '')
                {
                    $finalBalance   = $customerWallet->final_balance + $amountReceived;
                    $customerLedger = NULL;
                    $customerLedger = new CustomerLedger;
                    $customerLedger->booking_id    = 0;
                    $customerLedger->customer_id   = $customerId;
                    $customerLedger->debit         = 0;
                    $customerLedger->credit        = $amountReceived;
                    $customerLedger->final_balance = $finalBalance;
                    $customerLedger->created_at    = date("Y-m-d H:i:s");
                    $customerLedger->remark        = "Amount received online";
                    $customerLedger->notes         = "Amount received online - ". $orderId;;
                    $customerLedger->save();    
                }
                else
                {
                    $customerLedger = new CustomerLedger;
                    $customerLedger->booking_id    = 0;
                    $customerLedger->customer_id   = $customerId;
                    $customerLedger->debit         = 0;
                    $customerLedger->credit        = $amountReceived;
                    $customerLedger->final_balance = $amountReceived;
                    $customerLedger->created_at = date("Y-m-d H:i:s");
                    $customerLedger->remark        = "Amount received online";
                    $customerLedger->notes         = "Amount received online - ". $orderId;;
                    $customerLedger->save();
                }
            }
            else
            {
                if($getLastOrder != '')
                {
                    $getLastOrder->mg_balance =  $this->_getCustomerBalance($customerId);
                }
                $response['success'] = true;
                $response['message'] = "Transaction failed.";
                $response['mg_balance']    =  $this->_getCustomerBalance($customerId);
            }
        }
        $getLastOrder = CustomerOrder::where('customer_id',$customerId)->orderBy('id', 'desc')->first();
        if($getLastOrder != '')
        {
            $getLastOrder->mg_balance =  $this->_getCustomerBalance($customerId);
        }
        
        $response['success'] = true;
        $response['message'] = "Your transaction has been successfully processed. The amount will be reflected in your MaalGaadi account within 24 hours. Please save the transaction number for future references.";
        $response['data']    = $getLastOrder;
        return $response;
    }
    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 
    public function _getCustomerBalance($customerId)
    {
        
        $customerWallet = CustomerLedger::where('customer_id', $customerId)->orderBy('id', 'desc')->first();
        $balance = 0;
        
        if($customerWallet != '')
        {
            $balance = $balance + $customerWallet->final_balance;
        }
        return $balance;
    }

    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 
    public function encrypt($plainText,$key)
    {
        $secretKey = $this->hextobin(md5($key));
        $initVector = pack("C*", 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f);
        $openMode = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '','cbc', '');
        $blockSize = mcrypt_get_block_size(MCRYPT_RIJNDAEL_128, 'cbc');
        $plainPad = $this->pkcs5_pad($plainText, $blockSize);
        if (mcrypt_generic_init($openMode, $secretKey, $initVector) != -1) 
        {
              $encryptedText = mcrypt_generic($openMode, $plainPad);
                  mcrypt_generic_deinit($openMode);
                        
        } 
        return bin2hex($encryptedText);
    }
    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 
    public function decrypt($encryptedText,$key)
    {
        $secretKey = $this->hextobin(md5($key));
        $initVector = pack("C*", 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f);
        $encryptedText= $this->hextobin($encryptedText);
        $openMode = mcrypt_module_open(MCRYPT_RIJNDAEL_128, '','cbc', '');
        mcrypt_generic_init($openMode, $secretKey, $initVector);
        $decryptedText = mdecrypt_generic($openMode, $encryptedText);
        $decryptedText = rtrim($decryptedText, "\0");
        mcrypt_generic_deinit($openMode);
        return $decryptedText;
        
    }
    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 

    public function pkcs5_pad ($plainText, $blockSize)
    {
        $pad = $blockSize - (strlen($plainText) % $blockSize);
        return $plainText . str_repeat(chr($pad), $pad);
    }

    # Function : This function is  Add money in customer waller By online Payment
    # Request : Customer Id , Order Id, encResp ,amount
    # Response : Json message
    # Autor : Vinod 

    public function hextobin($hexString) 
    { 
        $length = strlen($hexString); 
        $binString="";   
        $count=0; 
        while($count<$length) 
        {       
            $subString =substr($hexString,$count,2);           
            $packedString = pack("H*",$subString); 
            if ($count==0)
        {
            $binString=$packedString;
        } 
            
        else 
        {
            $binString.=$packedString;
        } 
            
        $count+=2; 
        } 
        return $binString; 
    }

    # Function : This function is for track customer registered complaints
    # Request : booking_id
    # Response : Json message
    # Autor : Brijendra 
    public function trackComplaint(Request $request)
    {
        $data = $request->all();
        $response = array();
        if (isset($data['customer_id']) && $data['customer_id'] != "") 
        {
            $customerId = $data['customer_id'];
        }
        else
        {
            $response['success'] = false;
            $response['message'] = "Customer Id not found.";
            $response['data']    = (object) array();
            return $response;
        }

        $fifteenDays = date('Y-m-d H:i:s',strtotime('-15 days'));

        if (isset($data['booking_id']) && $data['booking_id'] != "") 
        {

            $bookingComplaint = Complaint::where('trip_id', $data['booking_id'])->where('customer_id', $customerId)->get();
            if (count($bookingComplaint) > 0) 
            {

                $driverIdsArray = array();
                $complaintTypeIdsArray = array();
                $subComplaintTypeIdsArray = array();
                foreach ($bookingComplaint as $key => $value) 
                {
                    array_push($driverIdsArray, $value->driver_id);
                    array_push($complaintTypeIdsArray, $value->complaint_type_id);
                    array_push($subComplaintTypeIdsArray, $value->sub_complaint_type_id);
                }


                $driverDetails = Driver::whereIn('id', $driverIdsArray)->get()->keyBy('id');
                $complaintType = ComplaintType::whereIn('id', $complaintTypeIdsArray)->get()->keyBy('id');
                $subComplaintType = SubComplaintType::whereIn('id', $subComplaintTypeIdsArray)->get()->keyBy('id');
                foreach ($bookingComplaint as $key => $value) 
                {
                    if (isset($driverDetails[$value->driver_id])) 
                    {
                        $value->driver_name = $driverDetails[$value->driver_id]['driver_name'];
                        $value->driver_number = $driverDetails[$value->driver_id]['driver_number'];
                    }
                    else
                    {
                        $value->driver_name = "NA";
                        $value->driver_number = "NA";
                    }

                    if (isset($complaintType[$value->complaint_type_id])) 
                    {
                        $value->complaint_title = $complaintType[$value->complaint_type_id]['complaint_type'];
                    }
                    else
                    {
                        $value->complaint_title = "NA";
                    }

                    if (isset($subComplaintType[$value->sub_complaint_type_id])) 
                    {
                        $value->sub_complaint_title = $subComplaintType[$value->sub_complaint_type_id]['sub_complaint'];
                    }
                    else
                    {
                        $value->complaint_title = "NA";
                    }

                    if ($value->status == 0) 
                    {
                        $value->status = "Pending";
                        $value->title_message = "We're working on your issue regarding booking id ". $value->trip_id . " .We'll inform you as soon as this is resolved";
                    }
                    else
                    {
                        $value->status = "Resolved";
                        $value->title_message = "Your issue regarding booking id ". $value->trip_id ." has been resolved";
                    }

                    if ($value->feedback == "") 
                    {
                        $value->feedback = "This is pending booking";
                    }

                    $value->complaint_date = date('d-m-Y H:i:s', strtotime($value->created_at));
                }

                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = $bookingComplaint;
                return $response;

            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Record not found.";
                $response['data']    =  array();
                return $response;
            }
        }
        else
        {

            $complaintList = Complaint::where('customer_id', $customerId)->where('created_at', '>=', $fifteenDays)->get();

            if (count($complaintList) > 0) 
            {

                $driverIdsArray = array();
                $complaintTypeIdsArray = array();
                $subComplaintTypeIdsArray = array();
                foreach ($complaintList as $key => $value) 
                {
                    array_push($driverIdsArray, $value->driver_id);
                    array_push($complaintTypeIdsArray, $value->complaint_type_id);
                    array_push($subComplaintTypeIdsArray, $value->sub_complaint_type_id);
                }

                $driverDetails = Driver::whereIn('id', $driverIdsArray)->get()->keyBy('id');
                $complaintType = ComplaintType::whereIn('id', $complaintTypeIdsArray)->get()->keyBy('id');
                $subComplaintType = SubComplaintType::whereIn('id', $subComplaintTypeIdsArray)->get()->keyBy('id');

                foreach ($complaintList as $key => $value) 
                {
                    if (isset($driverDetails[$value->driver_id])) 
                    {
                        $value->driver_name   = $driverDetails[$value->driver_id]['driver_name'];
                        $value->driver_number = $driverDetails[$value->driver_id]['driver_number'];
                    }
                    else
                    {
                        $value->driver_name = "NA";
                        $value->driver_number = "NA";
                    }

                    if (isset($complaintType[$value->complaint_type_id])) 
                    {
                        $value->complaint_title = $complaintType[$value->complaint_type_id]['complaint_type'];
                    }
                    else
                    {
                        $value->complaint_title = "NA";
                    }

                    if (isset($subComplaintType[$value->sub_complaint_type_id])) 
                    {
                        $value->sub_complaint_title = $subComplaintType[$value->sub_complaint_type_id]['sub_complaint'];
                    }
                    else
                    {
                        $value->complaint_title = "NA";
                    }

                    if ($value->status == 0) 
                    {
                        $value->status = "Pending";
                        $value->title_message = "We're working on your issue regarding booking id ". $value->trip_id . ".We'll inform you as soon as this is resolved";
                    }
                    else
                    {
                        $value->status = "Resolved";
                        $value->title_message = "Your issue regarding booking id ". $value->trip_id ." has been resolved";
                    }

                    if ($value->feedback == "") 
                    {
                        $value->feedback = "This is pending booking";
                    }


                    $value->complaint_date = date('d-m-Y H:i:s', strtotime($value->created_at));
                }

                $response['success'] = true;
                $response['message'] = "Record found.";
                $response['data']    = $complaintList;
                return $response;
            }
            else
            {
                $response['success'] = false;
                $response['message'] = "Record not found.";
                $response['data']    =  array();
                return $response;
            }
        }
    }
    

}//End class
