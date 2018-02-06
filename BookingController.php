<?php

namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use Auth;
use Config;
use Mail;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Driver;
use App\CreditLimit;
use Sly\NotificationPusher\PushManager;
use Sly\NotificationPusher\Adapter;
use PushNotification; 
use App\Booking;
use App\DriverUpdate;
use App\Vehicle;
use App\DriverToken;
use App\DriverIncompleteTrip;
use App\DriverDetials;
use App\Customer;
use App\BookingStatus;
use App\CancelBooking;
use App\CustomerLedger; 
use App\FavoriteLocation;
use App\DriverRegular;
use App\BookingDetials;
use App\TripRoute;
use App\DriverBookingStatus;
use App\BookingEstimate;
use App\BookingFinal;
use App\DriverWallet;
use App\Employee;
use App\User;
use App\DashboardNotification; 
use App\AllotedBooking; 
use DB;
use App\CustomerDiscount;
use App\BookingAlert;
use App\Rating;
use App\BookingFinalData;
use App\MaalgaadiSetting;
use App\DriverRating;
use App\CustomerCreditLimit;
use App\SurgeSetting;
use App\GoodsType;
use App\MaalgaadiSettings;
use App\EmployeeAllotment;
use App\BookingDiscountCode;
use App\DiscountCouponCode;
use App\BookingCustomerDetails;
use App\BookingDriverDetails;
use App\VehicleGood;
use App\BillingType;
use App\FavoriteLocationCustomer;
use App\AverageRating;
use App\CustomerDropPoints;
use App\BookingRebook;
use App\BookingRemarks;
use App\BookingEta;
use App\DriverOnBoarding;
use App\FirstVisit;
use App\BookingSurgeParameter;
use App\DriverCancelLocation;

class BookingController extends Controller
{
    # Function : This function is  used for get customer Credit limit
    # Request : customer Id
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : vinod 
    public function getCustomerCreditLimit(Request $request)
    {
        $data     = $request->all(); 
        $org      = $data['customer_id'];
        $customer = Customer::select('id')->where('cust_organization','=',$org)->first();
        $data['limit'] = false;
        if($customer != '')
        {   
            $custumerId = $customer->id;
            $data = CustomerCreditLimit::select('credit_limit','customer_id')->where('approved_by','!=','0')->where('customer_id','=',$custumerId)->first();
            if($data!='')
            {
                if($data->credit_limit > 0)
                {
                    $data['limit'] = true;
                }
            }
        }
        return $data;
    }

    # Function : This function is  used check email id is already exist or not
    # Request : email
    # Response : Json message
    # Author : Vinod Gami
    public function checkEmailBooking(Request $request)
    {
        $data  = array();
        $data  = $request->all();
        $email = NULL;
        //check for email
        if(isset($data['email']))
        {
            $email = $data['email'];
            $customerDetials = Customer::where('cust_email', $email)->first();
            if(isset($customerDetials->cust_email))
            {
                $result = array();
                $result['success']['message'] = "Already exist";
                return $result;
            }
            else
            {
                $result = array();
                $result['error']['message'] = "No record found";
                return $result;
            }
        }
        else
        {
            $result = array();
            $result['error']['message'] = "Email Required";
            return $result;
        }
    }

    # Function : This function is  used check mobile number is already exist or not
    # Request : mobile
    # Response : Json message
    # Author : Vinod Gami
    public function checkPhoneBooking(Request $request)
    {
        $data  = array();
        $data  = $request->all();
        $phone = NULL;
        //check for Mobile Number
        if(isset($data['phone']))
        {
            $phone = $data['phone'];
            $customerDetials = Customer::where('cust_number', $phone)->first();
            
            if(isset($customerDetials->cust_number))
            {
                $result = array();
                $result['success']['message'] = "Already exist";
                return $result;
            }
            else
            {
                $result = array();
                $result['error']['message'] = "No record found";
                return $result;
            }
        }
        else
        {
            $result = array();
            $result['error']['message'] = "Phone Number Required";
            return $result;
        }
    }
    
    # Function : This function is  used get Free Driver Details
    # Request : none
    # Response : Json message
    # Author : Vinod Gami
    public function getFreeDriversDetials()
    {
        $vehicleCategoryArray = array();
        $today           = date('Y-m-d').' 00:00:00';
        $vehicleCategory = Vehicle::select('vehicle_name', 'id')->get();
        foreach ($vehicleCategory as $key => $value) 
        {
            if(!isset($vehicleCategoryArray[$value['id']]))
            {
                $vehicleCategoryArray[$value['id']] = $value;
            }
        }
        $newTime = date("Y-m-d H:i:s",strtotime(date("Y-m-d H:i:s")." -3 minutes"));
        $loginDriverData = DriverRegular::select('driver_id')
                        ->where('status', 'free')
                        ->where('created_at', '>=', $newTime)
                        ->groupBy('driver_id')
                        ->orderBy('created_at', 'desc')
                        ->get();
        $arrayDriverDetials = array();
        $driverIds = array();
        foreach ($loginDriverData as $key => $value) 
        {
            array_push($driverIds, $value['driver_id']);
        }

        $driverDetials = Driver::select('id', 'vehicle_category_id','driver_name','driver_number','vehicle_reg_no','driver_address','driver_status','mg_id')->whereIn('id', $driverIds)->get();
        foreach ($driverDetials as $key => $value) 
        {
            $driverWallet    = DriverWallet::where('driver_id', $value->driver_id)->orderBy('id', 'desc')->first();
            $driverLoginDetials = DriverDetials::where('created_at', ">", $today)->where('driver_id', $value->driver_id)->first();
            
            if(isset($value->mg_id))
            {
                $driverString   = $value->mg_id;    
            }
            else
            {
                $driverString   = $value->driver_name.' (0)';       
            }
            $vehicle = Vehicle::where('id', $value->vehicle_category_id)->first();
            preg_match_all('/\b\w/', $vehicle->vehicle_name, $match);
            $vehicleShortCode = implode($match[0]);
            if(isset($value->mg_id))
            {
                $driverString   = $value->mg_id;    
            }
            else
            {
                $driverString   = $value->driver_name.' (0)';       
            }

            if($vehicleShortCode != '')
            {
                $driverString .= ' ('.$vehicleShortCode.')';   
            }
            else
            {
                $driverString .= ' (NA) ';
            }

            if(isset($driverLoginDetials->loading_unloading_status))
            {
                if($driverLoginDetials->loading_unloading_status == "yes")
                {
                    $driverString .= ' (L/UL) ';    
                }
                else
                {
                    $driverString .= ' (WL/WUL) ';
                }
            }
            else
            {
                $driverString .= ' (WL/WUL) ';
            }

            if(isset($driverLoginDetials->helper_status))
            {
                if($driverLoginDetials->helper_status == "yes")
                {
                    $driverString .= ' (H) ';   
                }
                else
                {
                    $driverString .= ' (WH) ';
                }
            }
            else
            {
                $driverString .= ' (WH) ';
            }

            if(isset($driverWallet->balance))
            {
                $value->wallet = " (".$driverWallet->balance.")";    
                $driverString .= " (".$driverWallet->balance.")";
            }
            else
            {
                $value->wallet = 0;    
                $driverString .= "(0)";   
            }

            $value->driver_name = $driverString;
            if(isset($vehicleCategoryArray[$value['vehicle_category_id']]))
            {
                $value['vehicle_name'] = $vehicleCategoryArray[$value['vehicle_category_id']]['vehicle_name'].' - '.$value['driver_name'];    
            }
        }
        return $driverDetials;
    }

    # Function : This function is used for cancel booking From dashboard
    # Request : Booking Id, Reason, issue Type
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : Vinod
    public function cancelBooking(Request $request)
    {
        $data = $request->all();
        $array = array();
        if(isset($data['booking_id']))
        {
            $bookingStatusDetails = BookingStatus::where('booking_id', $data['booking_id'])->first();
            if($bookingStatusDetails != "")
            {
                if(!is_null($bookingStatusDetails->complete))
                {
                    $array ['error']= 1;
                    $array['message'] = "Booking is completed";
                    return $array;
                }
            }
            
            $checkAlreadyCancel = CancelBooking::where('booking_id',$data['booking_id'])->first();
            if($checkAlreadyCancel)
            {
                $array ['error']= 1;
                $array['message'] = "Booking already cancelled.";
                return $array;
            }

            $bookingstatus = BookingStatus::where('booking_id', $data['booking_id'])->first();
            $deletedRows = EmployeeAllotment::where('booking_id',$data['booking_id'])->delete();
            if($bookingstatus != "")
            {
                $bookingId   = $data['booking_id'];
                $reason      = $data['reason'];
                $issues_type = $data['issues_type'];
                $action      = $data['action'];
                $bookingDetials   = Booking::find($bookingId);
                $driverId         = $bookingDetials->driver_id;
                if($bookingDetials->driver_id != 0)
                {
                    $specialFunction = new CommonFunctionController;
                    $specialFunction->updateTripStatus($driverId, $bookingId, 'completed', '');
                    $driverCode = Driver::select('mg_id')->where('id', $bookingDetials->driver_id)->first();
                    if($driverCode != "")
                    {
                        $bookingDetials->mg_code = $driverCode->mg_id;    

                    }
                }    

                $cancelBooking = new CancelBooking;
                if(isset(Auth::user()->id))
                {
                   $cancelBooking->employee_id = Auth::user()->id; 
                }
                else
                {
                    if(isset($data['employeeId']))
                    {
                        $cancelBooking->employee_id = $data['employeeId'];
                    }
                    else
                    {
                        $cancelBooking->employee_id = 1;
                    }
                }

                $cancelBooking->booking_id  = $bookingId;
                $cancelBooking->reason      = $reason;
                $cancelBooking->issues_type = $issues_type;
                $cancelBooking->action      = $action;
                $cancelBooking->created_at  = date("Y-m-d H:i:s");
                $cancelBooking->save();

                $bookingDetials->driver_id = '-1';   
                $bookingDetials->current_status = 'cancel';    
                $bookingDetials->save();

                //booking status
                $bookingstatus = BookingStatus::where('booking_id', $data['booking_id'])->first();
                $bookingstatus->cancel_time = date("Y-m-d H:i:s");
                $bookingstatus->save();
                
                $allotedBooking = AllotedBooking::where('booking_id', $bookingId)->get();    
                        
                if(count($allotedBooking) > 0)
                {
                    foreach ($allotedBooking as $key => $value) 
                    {

                        $dashboardNotification = DashboardNotification::where('driver_id', $value->driver_id)->where('booking_id', $bookingId)->first();

                        if($dashboardNotification == '' ||  $value->driver_id == $driverId)
                        {
                            $driverDetials  = Driver::select('id', 'tokenid')->where('id', $value->driver_id)->first();
                            if(isset($driverDetials->tokenid))
                            {
                                $bookingResult = array();
                                $bookingResult['cancel']['message']    = 'यह बुकिंग ग्राहक द्वारा निरस्त कर दी गई है.';
                                $bookingResult['cancel']['booking_id'] = $bookingId;
                                $message = PushNotification::Message(array(
                                        'message' => 'यह बुकिंग ग्राहक द्वारा निरस्त कर दी गई है.',
                                        'cancel_booking' => $bookingResult
                                        ));
                                $deviceToken    = $driverDetials->tokenid;
                                $result = NULL;
                                $result = PushNotification::app('appNameAndroid')->to($deviceToken)
                                ->send($message);
                            }// if isset 
                        }//if dashaborad
                    }// foreach end 
                } // if assigned

                $customerDetials = Customer::find($bookingDetials->customer_id);
                
                $text = "Trip Id  ".$bookingId." has been cancelled for ".$reason;

                $notification = new CommonFunctionController;
                $notification->getDetailsForNotification($customerDetials->cust_number, $text, 'billing', 'Customer', $bookingId);

                
                $array ['error']= 0;
                $array['message'] = "booking Cancelled";
                return $array;
         }// status check    
         else
         {
                $array ['error']= 1;
                $array['message'] = "Booking is completed";
                return $array;
         }// status check else
        }
        else 
        {
            $array['error'] = 1;
            $array['message'] = "Booking id and reason required";
            return $array; 
        }
    }

    # Function : This function is used for Calculate Estimation Bill of booking
    # Request : Booking data , customer Data
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : Vinod
    public function calculateEstimated(Request $request)
    {
        $data     = $request->all();
        $distancePercentage = 0;
        $distanceLowerPercentage = 0;
        $customer = NULL;
        $pick     = NULL;
        $drop     = NULL; 
        $vehicle  = NULL;
        $info     = NULL;
        $billing  = NULL;
        $totalTripCharge = 0;
        $discountAmount  = 0;
        $area = array(); 
        //customer detials check
        if(isset($data['customer']))
        {
            $customer = json_decode($data['customer']);    
        }

        //pick detials check
        if(isset($data['pick']))
        {
            $pick = json_decode($data['pick']);   
            $resultArray['pick'] = $pick; 
        }

        //drop detials check
        if(isset($data['drop']))
        {
            $drop = json_decode($data['drop']);    
            $resultArray['drop'] = $drop; 
        }

        //vehicle detials check
        if(isset($data['vehicle']))
        {
            $vehicle = json_decode($data['vehicle']); 
            $distancePercentage = $vehicle->distance_buffer_percentage;  
            $distanceLowerPercentage = $vehicle->lower_distance_buffer;  
        }

        //vehicle detials check
        if(isset($data['info']))
        {
            $info = json_decode($data['info']);    
        }

        //billing detials check
        if(isset($data['billing']))
        {

            $billing = json_decode($data['billing']); 
            // $billing->buffer_estimated_distance = 0;
            //pod check
            if(isset($billing->e_pod) && $billing->e_pod == true)
            {
                $resultArray['pod'] = true; 
                $resultArray['e_pod'] = true;     
            }
            else
            {
                $resultArray['pod'] = false; 
                $resultArray['e_pod'] = false;     
            }

            if(isset($billing->pod) && $billing->pod == true)
            {
                $resultArray['pod'] = true; 
            }
            else
            {
                $resultArray['pod'] = false; 
            }

            //unloading check
            if(isset($billing->tick_unloading) && $billing->tick_unloading == true)
            {
                $resultArray['tick_unloading'] = true;    
            }
            else
            {
                $resultArray['tick_unloading'] = false;    
            }
            
            //chcek loading
            if(isset($billing->tick_loading) && $billing->tick_loading == true)
            {
                $resultArray['tick_loading'] = true;    
            }
            else
            {
                $resultArray['tick_loading'] = false;
            }
        }

        $distanceMeter = 0; 
        $distance      = '0 Kms'; 
        $time          = 0; 
        $timeText      = '0 min'; 
        $distance      = $distanceMeter/1000;
        $destination   = NULL;
        if(isset($drop->lat) && isset($drop->lng))
        {
            $dropLandmark = $drop->drop_landmark;
            $dropLat = $drop->lat;
            $dropLng = $drop->lng;
            $destination = $drop->lat.','.$drop->lng; 
            $resultArray['drop_lat'] = $drop->lat;
            $resultArray['drop_lng'] = $drop->lng;
        }
        else
        {
            $drop->lat = 0;
            $drop->lng = 0;
        }
        $origins = NULL;
        if(isset($pick->lat) && isset($pick->lng))
        {
            $origins = $pick->lat.','.$pick->lng;
            $resultArray['pick_lat'] = $pick->lat;
            $resultArray['pick_lng'] = $pick->lng;
        }
        $getFavLocation = '';
        $data['no_of_drop_points'] = 1;
        $resultArray['no_of_drop_points'] = 1;
        if(isset($data['multipleDrop']) && $data['multipleDrop'] == '')
        {
            $getFavLocation = FavoriteLocation::where('pickup_lat',$pick->lat)->where('pickup_lng',$pick->lng)->where('drop_lat',$drop->lat)->where('drop_lng',$drop->lng)->first();
        }
        
        
        if($getFavLocation != '' && $getFavLocation->distance_meter != 0)
        {
            $distanceMeter = $getFavLocation->distance_meter;
            $distance      = $getFavLocation->distance;
            $time          = $getFavLocation->time;
            $timeText      = $getFavLocation->time_text;
            $distance      = number_format($distanceMeter/1000, 1, '.', '');
        }
        else if($origins != NULL && $destination != NULL)
        {
            
            $wayponts = '';
            $countPoint = 0;
            if(isset($data['multipleDrop']))
            {
                $multipleDropPoints = json_decode($data['multipleDrop'],true);
                if($multipleDropPoints)
                {
                    $multipleLandmark = $multipleDropPoints['landmark'];
                    $multipleLatitute = $multipleDropPoints['latitute'];
                    $multipleLongitude = $multipleDropPoints['longitude'];
                    $multipleAddress = $multipleDropPoints['address'];
                    $key = count($multipleLandmark);
                    $multipleLandmark[$key] = $dropLandmark;
                    $multipleLatitute[$key] = $dropLat;
                    $multipleLongitude[$key] = $dropLng;
                    $multipleDropCount = 0;

                    if($multipleLandmark)
                    {
                        for($j=0;$j< count($multipleLandmark);$j++)
                        {
                            if($wayponts!='')
                            {
                                $wayponts = $wayponts.'|';
                            }
                            if($multipleLatitute[$j])
                            {
                                $multipleDropCount++;
                                if($multipleDropCount < count($multipleLandmark))
                                {
                                    $wayponts = $wayponts.$multipleLatitute[$j].','.$multipleLongitude[$j]; 
                                }
                            }
                        }  
                        $resultArray['no_of_drop_points'] = $multipleDropCount + $data['no_of_drop_points'] - 1; 
                    }
                }
            }
            $area = array(
                    'pick_lat' => $resultArray['pick_lat'],
                    'pick_lng' => $resultArray['pick_lng'],
                    'drop_lat' => $resultArray['drop_lat'],
                    'drop_lng' => $resultArray['drop_lng'],
                    'booking_schedule_time' => $info->booking_schedule_time
                    );

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
                    $dataDistance->routes[0]->legs[$p]->steps[$m]->duration->value;

                    $durationSec = $durationSec + $dataDistance->routes[0]->legs[$p]->steps[$m]->duration->value;
                } 
            }
        
            $distance      = $distanceMeter/1000;  //distanceKM
            $distance      = number_format($distanceMeter/1000, 1, '.', ''); 
            $durationMin   = round($durationSec/60);
            $time          = $durationMin;
            $timeText      = $durationMin.' min';
            
            $updateFavLocation = FavoriteLocation::where('pickup_lat',$pick->lat)->where('pickup_lng',$pick->lng)->where('drop_lat',$drop->lat)->where('drop_lng',$drop->lng)->first();
            if($updateFavLocation != '')
            {
                $updateFavLocation->distance_meter = $distanceMeter;
                $updateFavLocation->distance = $distance;
                $updateFavLocation->time = $time;
                $updateFavLocation->time_text = $timeText;
                $updateFavLocation->save();
            }
            $distance      = number_format($distanceMeter/1000, 1, '.', '');

        }
        $resultArray['buffer_estimated_distance']   = 0;
        $resultArray['estimated_distance_in_meter'] = $distanceMeter + round(($distanceMeter * $distancePercentage)/100);
        $resultArray['estimated_distance']          = number_format((($distanceMeter + round(($distanceMeter * $distancePercentage)/100)) / 1000), 1, '.', '');
        $resultArray['buffer_estimated_distance_in_meter'] = $distanceMeter - round(($distanceMeter * $distanceLowerPercentage)/100);
        $resultArray['buffer_estimated_distance']          = number_format((($distanceMeter - round(($distanceMeter * $distanceLowerPercentage)/100)) / 1000), 1, '.', '');
        $resultArray['estimated_trip_time']         = $time;
        $resultArray['estimated_trip_time_text']    = $timeText;

        //Distance price calculation
        $temp  = number_format((($distanceMeter + round(($distanceMeter * $distancePercentage)/100)) / 1000), 1, '.', '');
        $temp1 = number_format((($distanceMeter - round(($distanceMeter * $distanceLowerPercentage)/100)) / 1000), 1, '.', '');
        if($vehicle != "")
        {
            $mainDistance = $temp - $vehicle->base_distance;
            if($mainDistance > 0)
            {
                $mainDistance = $temp - $vehicle->base_distance;
            }
            else
            {
                $mainDistance = 0;
            }
            $totalTripCharge = round($totalTripCharge + ($vehicle->base_fare + ($vehicle->rate * $mainDistance)));
            $resultArray['trip_charge'] = round($totalTripCharge);

            $totalTripCharge1 = 0;
            $mainDistance1 = $temp1 - $vehicle->base_distance;
            if($mainDistance1 > 0)
            {
                $mainDistance1 = $temp1 - $vehicle->base_distance;
            }
            else
            {
                $mainDistance1 = 0;
            }
            $totalTripCharge1 = round($totalTripCharge1 + ($vehicle->base_fare + ($vehicle->rate * $mainDistance1)));
            $resultArray['lower_trip_charge'] = round($totalTripCharge1);
        }
        
        //drop point charge calculation
        if(isset($resultArray['no_of_drop_points']) && isset($vehicle->allowed_drop_point))
        {
            if($vehicle->allowed_drop_point < $resultArray['no_of_drop_points'])
            {
                //if drop point are greater then allowed then add drop point charge
                $dropPoint = $resultArray['no_of_drop_points'] - $vehicle->allowed_drop_point;
                $totalTripCharge = $totalTripCharge + ($dropPoint * $vehicle->rate_per_drop_point);
                $resultArray['drop_point_charge'] = ($dropPoint * $vehicle->rate_per_drop_point);
            }
            else 
            {
                $totalTripCharge = $totalTripCharge + 0.00;
                $resultArray['drop_point_charge'] = 0.00;
            }
        }
        else
        {
            $totalTripCharge = $totalTripCharge + 0.00;
            $resultArray['drop_point_charge'] = 0.00;
        }

        $vehicelMeta = VehicleGood::where('vehicle_id',$vehicle->id)->where('good_id',$info->type_of_goods)->first();
        if(isset($billing->tick_unloading))
        {
            if($billing->tick_unloading == true)
            {
                if(isset($vehicle->unloading_charge))
                {
                    $totalTripCharge = $totalTripCharge + $vehicelMeta->unloading_charge;
                    $resultArray['unloading_charge'] = $vehicelMeta->unloading_charge;    
                }
                else
                {
                    $resultArray['unloading_charge'] = 0;          
                }
            }
            else
            {
                $resultArray['unloading_charge'] = 0;   
            }
        }
        else
        {
            $resultArray['unloading_charge'] = 0;   
        }
        
        if(isset($billing->tick_loading))
        {
            if($billing->tick_loading == true)
            {
                $totalTripCharge = $totalTripCharge + $vehicelMeta->loading_charge;
                $resultArray['loading_charge']   = $vehicelMeta->loading_charge;
            }
            else
            {
                $resultArray['loading_charge']   = 0;
            }
        }
        else
        {
            $resultArray['loading_charge']   = 0;
        }
        
        if(isset($billing->pod) && $billing->pod == true)
        {   
            if(isset($vehicle->pod_charge))
            {
                $totalTripCharge = $totalTripCharge + $vehicle->pod_charge;
                $resultArray['pod_charge'] = $vehicle->pod_charge;
            }
            else
            {
                $totalTripCharge = $totalTripCharge + 0;
                $resultArray['pod_charge'] = 0;
            }
        }
        else
        {
            $resultArray['pod_charge'] = 0;
        }
        if(isset($vehicle) && $vehicle != '') 
        {
            $vehicleId   = $vehicle->id;
            if(!isset($customer->id)) 
            {
                $cust_number = $customer->cust_number;
                if($cust_number != "")
                {
                    $getCustomer = Customer::where('cust_number', $cust_number)->first();
                    $customerId  = $getCustomer->id;    
                }
            } 
            else 
            {
                $customerId  = $customer->id;
            }
            
            $tripAmount  = $totalTripCharge;
            $bookingType = $billing->booking_type;

            $key = 'allow_'.$bookingType;
            $getSetting = SurgeSetting::where('vehicle_id',$vehicleId)->first();

            if($getSetting != '' && $getSetting->$key == 1) 
            {
                $specialFunction = new CommonFunctionController;
                $bookingAddedBy = 'call_center';
                $response = $specialFunction->surgeCalculation($customerId, $vehicleId, $tripAmount, $bookingAddedBy, $area,$info->booking_schedule_time);
                $resultArray['totalSurgeAmount']     =  $response['totalSurgeAmount'];
                $resultArray['totalSurgePercentage'] =  $response['totalSurgePercentage'];
                $resultArray['differentSurgesDetails']      =  $response;
            } 
            else 
            {
                $resultArray['totalSurgeAmount']     =  0;
                $resultArray['totalSurgePercentage'] =  0;
                $resultArray['differentSurgesDetails'] = "";
            }  
            $totalTripCharge = round($totalTripCharge + $resultArray['totalSurgeAmount']);
        } 
        else 
        {
            $resultArray['totalSurgeAmount']     =  0;
            $resultArray['totalSurgePercentage'] =  0;
            $resultArray['differentSurgesDetails'] = "";
        }
        // echo $totalTripCharge;
        //calculating customer discount

        $bookScheduleTime = $info->booking_schedule_time;
        if(isset($billing->discount_amount))
        {
            $resultArray['discount_amount'] = $billing->discount_amount;
            $discountAmount = $billing->discount_amount;
        }
        else
        {
            $resultArray['discount_amount'] = 0;
            $discountAmount =  0;
        }
        //final amount
        $resultArray['final_amount'] = round($totalTripCharge - $discountAmount);
        return $resultArray;  
    }

    # Function : This function is used for calculate Hourly booking
    # Request : Vehicle , customer and Booking Details
    # Response : Json message
    # Author : Vinod 
    public function calculateEsitmatedWithHourly(Request $request){
        $data           = $request->all();
        $dataArray      = array();
        $vehicle = $data['vehicle'];
        $vehicle = json_decode($vehicle);
        $approximatelyHours = $data['approximatelyHours'];
        $bookingScheduleTime = $data['booking_schedule_time'];
        if(!empty($approximatelyHours))
        {
            $hourlyRate = $vehicle->hourly_rate;
            $totalTripHourlyCharge = $approximatelyHours * $hourlyRate;
        } 
        else
        {
            $totalTripHourlyCharge = 0;
        }
        
        if(isset($vehicle) && $vehicle != '') 
        {
            $vehicleId = $vehicle->id;
            $customerId = $data['customerId'];
            $bookingType = $data['bookingType'];
            $normalFare = $data['normal_fare'];
            if($normalFare > $totalTripHourlyCharge)
            {
                $tripAmount = $normalFare;
            } 
            else
            {
                $tripAmount = $totalTripHourlyCharge;
            }
            $dataArray['trip_charge'] =  $tripAmount;
            $key = 'allow_'.$bookingType;
            $getSetting = SurgeSetting::where('vehicle_id',$vehicleId)->first();

            if($getSetting != '' && $getSetting ->$key == 1) 
            {
                $specialFunction = new CommonFunctionController;
                $bookingAddedBy = 'call_center';
                $response = $specialFunction->surgeCalculation($customerId, $vehicleId, $tripAmount,$bookingAddedBy);
                $dataArray['totalSurgeAmount'] =  $response['totalSurgeAmount'];
                $dataArray['totalSurgePercentage'] =  $response['totalSurgePercentage'];
            } 
            else
            {
                $dataArray['totalSurgeAmount'] =  0;
                $dataArray['totalSurgePercentage'] =  0;
            }  
            $totalTripHourlyCharge = $totalTripHourlyCharge + $dataArray['totalSurgeAmount'];
        } 
        else
        {
            $dataArray['totalSurgeAmount'] =  0;
            $dataArray['totalSurgePercentage'] =  0;
        }

        $dataArray['totalTripHourlyCharge'] = $totalTripHourlyCharge;
        return $dataArray;
    }

    # Function : This function is used Update Booking 
    # Request : Booking Id, Customer Info, Booking Payment
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : Vinod, Brijendra
    public function addBooking(Request $request)
    {
        $data     = $request->all(); 

        $distancePercentage = 15;
        $customer = NULL;
        $pick     = NULL;
        $drop     = NULL; 
        $vehicle  = NULL;
        $info     = NULL;
        $billing  = NULL;
        $totalTripCharge = 0;
        $discountAmount  = 0;
        $customerID = NULL;
        $bookingIDE =NULL;
        $navigation = false;
        if(isset($data['payment']) && ($data['payment']!=''))
        {
            $payment=$data['payment'];
        }
        else
        {
             $payment='post';
        }
        
        //customer detials check
        if(isset($data['customer']))
        {
            $customer = json_decode($data['customer']);
            $phone                  = $customer->mobile;
            $cust_name              = $customer->cust_name; 
            $cust_email             = $customer->cust_email; 
            $cust_address           = $customer->cust_address;
            $cust_organization      = $customer->cust_organization; 
            $customer = Customer::where('cust_number',$phone)->first();
            if($customer!='')
            {
                $customerID = $customer->id;  
                $cityId  = $customer->city_id;
            }
            else
            {
                $addCustomer = new Customer;
                $addCustomer ->cust_number           = $phone;
                $addCustomer ->cust_name             = $cust_name;
                $addCustomer ->cust_email            = $cust_email;
                $addCustomer ->cust_address          = $cust_address;
                $addCustomer ->cust_organization     = $cust_organization;
                $addCustomer ->cust_business_product = 'NA';
                $addCustomer ->city_id               =  Auth::user()->city_id;
                if(Auth::check())
                {
                    $addCustomer->employee_id    = Auth::user()->id;    
                }
                else
                {
                    $addCustomer->employee_id = '0';
                }
                $addCustomer->status                = 'active';
                $addCustomer->cust_password         = bcrypt('12345');
                $addCustomer->save();
                $customerID = $addCustomer->id;
                $cityId  = $addCustomer->city_id;
            }
            
        }
        
        //pick detials check
        if(isset($data['pick']))
        {
            $pick = json_decode($data['pick']);    
        }
        
        //drop detials check
        if(isset($data['drop']))
        {
            $drop = json_decode($data['drop']);    
        }

        //vehicle detials check
        if(isset($data['vehicle']))
        {
            $vehicle = json_decode($data['vehicle']);
            $distancePercentage = $vehicle->distance_buffer_percentage;   
            $distanceLowerPercentage = $vehicle->lower_distance_buffer;  
        }

        //vehicle detials check
        if(isset($data['info']))
        {
            $info = json_decode($data['info']);  
            if(isset($info->flagCustomer))
            {
                if($info->flagCustomer == 1)    
                {
                    $navigation = true;
                }
                else
                {
                    $navigation = false;
                }
            }   
        }

        //billing detials check
        if(isset($data['billing']))
        {
            $billing = json_decode($data['billing']); 
            
            //pod check
            if(isset($billing->pod) && $billing->pod == true)
            {
                $resultArray['pod'] = true;    
            }
            else
            {
                $resultArray['pod'] = false;    
            }

            
            //unloading check
            if(isset($billing->tick_unloading) && $billing->tick_unloading == true)
            {
                $resultArray['unloading'] = true;    
            }
            else
            {
                $resultArray['unloading'] = false;    
            }
            
            //chcek loading
            if(isset($billing->tick_loading) && $billing->tick_loading == true)
            {
                $resultArray['loading'] = true;    
            }
            else
            {
                $resultArray['loading'] = false;
            }
        }
        $resultArray['estimated_distance'] = 0;
        $resultArray['lower_estimated_distance'] = 0;
        if(isset($billing->buffer_estimated_distance)) 
        {
            $lowerDistance   = $billing->buffer_estimated_distance;
            $distance = $billing->estimated_distance;
            $resultArray['estimated_distance'] = $distance;
            $resultArray['lower_estimated_distance'] = $lowerDistance;
        }

        if(isset($billing->fixedamount) && $billing->fixedamount !=0) 
        {
            $resultArray['trip_charge'] = $billing->fixedamount;
        } 
        else if(isset($billing->hourly_fare) && $billing->hourly_fare != 0)
        {
            $resultArray['trip_charge'] = $billing->trip_charge;
            $resultArray['lower_trip_charge'] = $billing->lower_trip_charge;
        }
        else
        {
            $temp = $distance;
            $mainDistance = $distance - $vehicle->base_distance;
            if($mainDistance > 0)
            {
                $mainDistance = $distance - $vehicle->base_distance;
            }
            else
            {
                $mainDistance = 0;
            }
            $totalTripCharge            = round($totalTripCharge + ($vehicle->base_fare + ($vehicle->rate * $mainDistance)));
            $resultArray['trip_charge'] = round($totalTripCharge);


            $totalTripCharge1 = 0;
            $temp2 = $lowerDistance;
            $mainDistance1 = $lowerDistance - $vehicle->base_distance;
            if($mainDistance1 > 0)
            {
                $mainDistance1 = $lowerDistance - $vehicle->base_distance;
            }
            else
            {
                $mainDistance1 = 0;
            }
            $totalTripCharge1            = round($totalTripCharge1 + ($vehicle->base_fare + ($vehicle->rate * $mainDistance1)));
            $resultArray['lower_trip_charge'] = round($totalTripCharge1);
        }

        //drop point charge calculation
        if(isset($info->no_of_drop_points))
        {
            if($vehicle->allowed_drop_point < $info->no_of_drop_points)
            {
                //if drop point are greater then allowed then add drop point charge
                $dropPoint                        = $info->no_of_drop_points - $vehicle->allowed_drop_point;
                $totalTripCharge                  = $totalTripCharge + ($dropPoint * $vehicle->rate_per_drop_point);
                $resultArray['drop_point_charge'] = ($dropPoint * $vehicle->rate_per_drop_point);
            }
            else 
            {
                $totalTripCharge = $totalTripCharge + 0.00;
                $resultArray['drop_point_charge'] = 0.00;
            }
        }
        else 
        {
            $totalTripCharge = $totalTripCharge + 0.00;
            $resultArray['drop_point_charge'] = 0.00;
        }
        
        if(isset($billing->tick_loading))
        {
            if($billing->tick_loading == true)
            {
                $totalTripCharge = $totalTripCharge + $billing->loading_charge;
                $resultArray['loading_charge']   = $billing->loading_charge;
            }
            else
            {
                $resultArray['loading_charge']   = 0;
            }
        }
        else
        {
            $resultArray['loading_charge']   = 0;
        }
        
        if(isset($billing->tick_unloading))
        {
            if($billing->tick_unloading == true)
            {
                $totalTripCharge = $totalTripCharge + $billing->unloading_charge;
                $resultArray['unloading_charge'] = $billing->unloading_charge;
            }
            else
            {
                $resultArray['unloading_charge'] = 0;   
            }
        }
        else
        {
            $resultArray['unloading_charge'] = 0;   
        }

        if(isset($billing->pod) && $billing->pod == true)
        {   
            $totalTripCharge = $totalTripCharge + $vehicle->pod_charge;
            $resultArray['pod_charge'] = $vehicle->pod_charge;
        }
        else
        {
            $resultArray['pod_charge'] = 0;
        }

        if(isset($billing->discount_amount)) 
        {
            if($billing->discount_amount != 0)
            {
                $resultArray['discount_amount'] = $billing->discount_amount;
                $discountAmount                 = $billing->discount_amount;
                $resultArray['discount'] = 0;
            }
            else
            {
                $resultArray['discount_amount'] = 0;
                $discountAmount                 = 0;
                $resultArray['discount'] = 0;
            }
        }
        else 
        {
                $resultArray['discount_amount'] = 0;
                $discountAmount                 = 0;
                $resultArray['discount'] = 0;
        }
        
        $resultArray['final_amount'] = $totalTripCharge - $discountAmount;
        
        //adding a new booking
        $booking = new Booking;
        $booking->customer_id        = $customerID;
        $booking->city_id            = $cityId;
        $booking->employee_id        = Auth::user()->id;
        $booking->vehicle_id         = $vehicle->id;
        $booking->alloted_to_id      = Auth::user()->id;
        if(isset($billing->discount_code_id))
        {
            $booking->discount_coupon_id = $billing->discount_code_id;
        }
        else
        {
            $booking->discount_coupon_id = 0;
        }
        
        
        if(isset($info->notes))
        {
            $booking->notes = $info->notes;    
        }
        else
        {
            $booking->notes = "";
        }
        $maalgaadiSetting  = MaalgaadiSettings::where('city_id',$cityId)->first();
        if($maalgaadiSetting->buffered_schedule_time != '')
        {
            $bufferTime  = $maalgaadiSetting->buffered_schedule_time; 
        }
        else
        {
            $bufferTime  = 30; 
        }
        $bookingScheduleTime = strtotime("+". $bufferTime ." minutes", strtotime(date('Y-m-d H:i:s')));

        if(isset($info->booking_schedule_time) && strtotime($info->booking_schedule_time) >= $bookingScheduleTime )
        {
            $booking->requirement_time = date('Y-m-d H:i:s',(strtotime($info->booking_schedule_time)));    
        }
        else
        {
            $booking->requirement_time = date('Y-m-d H:i:s',$bookingScheduleTime);
        }
        
        if(isset($info->no_of_drop_points))
        {
            $booking->drop_points = $info->no_of_drop_points;    
        }
        else
        {
            $booking->drop_points = 1;
        }
        if(isset($info->type_of_goods))
        {
            $booking->goods_id = $info->type_of_goods;    
        }
        $good = '';
        if($info->type_of_goods != '') 
        { 
            $good = GoodsType::find($info->type_of_goods);
        }
 
        if($good!='') 
        {
            $goodType = $good->goods_name;
        }
        else
        {
            $goodType = '';
        }

        if($goodType == 'Others')
        {
            if(isset($info->other_good))
            {
                $other_good = $info->other_good;   
            }
            else
            {
                $other_good = 'Others';
            }
            
            $booking->other_goods_text = $other_good;    
        } 

        if(isset($info->allotment_type) && $info->allotment_type == 'yes')
        {
            $booking->allotment_type = 1;
        }
        if(isset($billing->tick_loading) && $billing->tick_loading == true)
        {
           $loading = 1;
        }
        else
        {
            $loading = 0;
        }
        if(isset($billing->tick_unloading) && $billing->tick_unloading == true)
        {
           $unloading = 1;
        }
        else
        {
            $unloading = 0;
        }
        $booking->payment_option            = $payment;  
        $booking->loading_required          = $loading;
        $booking->unloading_required        = $unloading;
        $booking->navigation_required       = $navigation;
        $billingType = BillingType::where('type',$billing->booking_type)->first();
        $booking->customer_pricing_id       = $billingType->id;
        $booking->driver_pricing_id         = $billingType->id;
        $booking->current_status            = 'booked';
        $booking->waiting_time              = 0; 
        $booking->trip_time                 = $billing->estimated_trip_time;
        $booking->upper_trip_distance       = $distance;
        $booking->estimate_upper_trip_distance  = $distance;
        if($booking->upper_trip_distance == 0)
        {
            $booking->upper_trip_distance  = $booking->estimate_upper_trip_distance;
        }

        $booking->lower_trip_distance       = $lowerDistance;
        
        if(isset($billing->covered_status) && $billing->covered_status == 'yes')
        {
            $booking->covered_required = "1";
        }
        if(isset($billing->covered_status) && $billing->covered_status == 'no')
        {
            $booking->covered_required = "0";
        }
        if(isset($billing->e_pod) && $billing->e_pod == 'true')
        {
            $booking->e_pod_required = "1";
        }
        if(isset($billing->pod) && $billing->pod == 'true')
        {
            $booking->phy_pod_required = "1";
        }
        if(isset($billing->book_later) && $billing->book_later == 'true')
        {
            $booking->book_later = 1;
        }
        if ($billing->booking_type == 'hourly') 
        {
            if(isset($billing->approximatelyHours))
            {
                $booking->approximately_hours  = $billing->approximatelyHours;
            }
            else
            {
                $booking->approximately_hours  = 0;
            }    
        }
        $booking->created_at = date('Y-m-d H:i:s');
        $booking->save();
        $bookingId  = $booking->id;
        $bookingCustomerDetails = new BookingCustomerDetails;
        $bookingDriverDetails = new BookingDriverDetails;
        $bookingDriverDetails->booking_id = $bookingId;
        $bookingCustomerDetails->booking_id = $bookingId;
        if(isset($resultArray['lower_trip_charge']))
        {
            $bookingCustomerDetails->lower_trip_charge     = $resultArray['lower_trip_charge']; 
            $bookingDriverDetails->lower_trip_charge       = $resultArray['lower_trip_charge']; 
        }
        
        if(isset($resultArray['trip_charge']))
        {
            $bookingCustomerDetails->trip_charge = $resultArray['trip_charge'];  
            $bookingCustomerDetails->estimate_upper_trip_charge = $resultArray['trip_charge']; 
            $bookingDriverDetails->trip_charge = $resultArray['trip_charge'];
            $bookingDriverDetails->estimate_upper_trip_charge = $resultArray['trip_charge']; 
        }
         
        if($billing->tick_unloading == true)
        {
            $bookingCustomerDetails->unloading_charge = $resultArray['unloading_charge']; 
            $bookingDriverDetails->unloading_charge = $resultArray['unloading_charge'];   
        }
        else
        {
            $bookingCustomerDetails->unloading_charge = 0;   
            $bookingDriverDetails->unloading_charge = 0;
        }

        if($billing->tick_loading == true)
        {
            $bookingCustomerDetails->loading_charge = $resultArray['loading_charge']; 
            $bookingDriverDetails->loading_charge   = $resultArray['loading_charge']; 
        }
        else
        {
            $bookingCustomerDetails->loading_charge = 0;
            $bookingDriverDetails->loading_charge   = 0;    
        }
        
        
        if(isset($billing->pod) && $billing->pod == 'true')
        {
           $bookingCustomerDetails->pod_charge = $vehicle->pod_charge;
        }
        else
        {
            $bookingCustomerDetails->pod_charge = "0"; 
        }

        if(isset($billing->totalSurgeAmount))
        {
            $bookingCustomerDetails->estimate_surge_charge = $billing->totalSurgeAmount;
        } 
        else 
        {
            $bookingCustomerDetails->estimate_surge_charge = 0;
        }

        if(isset($billing->totalSurgePercentage))
        {
            $bookingCustomerDetails->surge_percentage = $billing->totalSurgePercentage;
        } 
        else 
        {
            $bookingCustomerDetails->surge_percentage = 0;
        }
        if(isset($resultArray['discount_amount']))
        {
            $bookingCustomerDetails->estimate_discount_amount = $resultArray['discount_amount'];
        }
        else
        {
            $bookingCustomerDetails->estimate_discount_amount = 0;
        }
        $bookingDriverDetails->drop_points_charge    = $resultArray['drop_point_charge'];
        $bookingCustomerDetails->drop_points_charge    = $resultArray['drop_point_charge'];
        $mgBonus = 0;
        $mgBonusPercentage = 0;
        if($bookingCustomerDetails->estimate_surge_charge != 0)
        {
            $tripAmount = $bookingCustomerDetails->trip_charge + $bookingCustomerDetails->loading_charge + $bookingCustomerDetails->unloading_charge + $bookingCustomerDetails->pod_charge + $bookingCustomerDetails->drop_points_charge;
            $area = array(
                    'pick_lat' => $pick->lat,
                    'pick_lng' => $pick->lng,
                    'drop_lat' => $drop->lat,
                    'drop_lng' => $drop->lng,
                    'booking_schedule_time' => $info->booking_schedule_time
                    );
            $commonFunction = new CommonFunctionController;
            $driverSurgeData = $commonFunction->driverSurgeCalculation($customerID, $vehicle->id, $tripAmount,$area,$info->booking_schedule_time);
            
            $mgBonus = $driverSurgeData['estimate_driver_surge_charge'];
            $mgBonusPercentage = $driverSurgeData['estimate_driver_surge_percentage']; 
        }
        $bookingDriverDetails->estimate_driver_surge_charge  = $mgBonus;
        $bookingDriverDetails->estimate_driver_surge_percentage  = number_format($mgBonusPercentage, 1, '.', ''); 
        
        $bookingDriverDetails->save();
        $bookingCustomerDetails->save();
       
        if(isset($billing->discount_amount) && $billing->discount_amount > 0)
        {
            $discountCodeId = $billing->discount_code_id;
            $code = new BookingDiscountCode;
            $code->booking_id = $bookingId;
            $code->customer_id = $customerID;
            $code->discount_coupon_id = $discountCodeId;
            $code->created_at = date('Y-m-d H:i:s');
            $code->save();
            $discountId = $code->id;
        }
        if(isset($data['multipleDrop']))
        {
            $multipleDropPoints = $data['multipleDrop'];  
            $multipleDropPoints = json_decode($multipleDropPoints,true);
            $countArray = $multipleDropPoints['longitude'];
            $count = sizeof($countArray);
                        
            $newArray = array();
            for ($i=0; $i < $count ; $i++) 
            { 
                $landmark = $multipleDropPoints['landmark'][$i];
                $longitude = $multipleDropPoints['longitude'][$i];
                $latitute = $multipleDropPoints['latitute'][$i];
                $multipleDrop                      =  new CustomerDropPoints;
                $multipleDrop->customer_id         =  $customerID;
                $multipleDrop->booking_id          =  $bookingId;
                $multipleDrop->drop_number         =  ''; 
                $multipleDrop->drop_landmark       =  $landmark;
                $multipleDrop->drop_lat            =  $latitute;
                $multipleDrop->drop_lng            =  $longitude;
                $multipleDrop->is_favourite        =  0;
                $multipleDrop->save();
            }
        }
        
        $employeeId = Auth::user()->id;
        $commonFunction = new CommonFunctionController;
        $commonFunction->addEmployeeAllotmentDashBoard($booking->id,'booked',$employeeId);

        $specialFunction = new CommonFunctionController;
        $specialFunction->setBookingStatus($booking->id, "booked", strtotime($info->booking_schedule_time));
        
        $favoriteLocation = new FavoriteLocation;
        $favoriteLocation->customer_id         =  $customerID;
        $favoriteLocation->employee_id        = Auth::user()->id;
        $favoriteLocation->booking_id          =  $booking->id;
        $favoriteLocation->pickup_number       =  $pick->pickup_number;
        $favoriteLocation->pickup_landmark     =  $pick->pickup_landmark;
        $favoriteLocation->pickup_lat          =  $pick->lat;
        $favoriteLocation->pickup_lng          =  $pick->lng;
        $favoriteLocation->drop_landmark       =  $drop->drop_landmark;
        $favoriteLocation->drop_lat            =  $drop->lat;
        $favoriteLocation->drop_lng            =  $drop->lng;
        $favoriteLocation->save();
        $checkPickLocation = FavoriteLocationCustomer::where('customer_id', $customerID)->where('lat', $pick->lat)->where('lan', $pick->lng)->first();
        if($checkPickLocation == '')
        {
            $pickupFav = new FavoriteLocationCustomer;
            $pickupFav->customer_id =  $customerID;
            $pickupFav->number =  $pick->pickup_number;
            $pickupFav->landmark =  $pick->pickup_landmark;
            $pickupFav->lat =  $pick->lat;
            $pickupFav->lan =  $pick->lng;
            $pickupFav->edit_by =  $customerID;
            $pickupFav->last_update_by =  'maalgaadi';
            $pickupFav->created_at =  date('Y-m-d H:i:s');
            $pickupFav->update_at =  date('Y-m-d H:i:s');
            $pickupFav->save();
        }
        $checkDropLocation = FavoriteLocationCustomer::where('customer_id', $customerID)->where('lat', $drop->lat)->where('lan', $drop->lng)->first();
        if($checkDropLocation == '')
        {
            $pickupFav = new FavoriteLocationCustomer;
            $pickupFav->customer_id =  $customerID;
            $pickupFav->landmark =  $drop->drop_landmark;
            $pickupFav->lat =  $drop->lat;
            $pickupFav->lan =  $drop->lng;
            $pickupFav->edit_by =  $customerID;
            $pickupFav->last_update_by =  'maalgaadi';
            $pickupFav->created_at =  date('Y-m-d H:i:s');
            $pickupFav->update_at =  date('Y-m-d H:i:s');
            $pickupFav->save();
        }

        if ($billing->totalSurgePercentage != 0) 
        {
            
            $usageSurgeAmount = 0;
            $usageSurgePercentage = 0;
            $daySurgeAmount = 0;
            $daySurgePercentage = 0;
            $dateSurgeAmount = 0;
            $dateSurgePercentage = 0;
            $areaSurgeAmount = 0;
            $areaSurgePercentage = 0;
            $callCenterSurgeAmount = 0;
            $callCenterSurgePercentage = 0;
            $extraSurgeAmount = 0;
            $extraSurgePercentage = 0;

            if (isset($billing->usageSurgeAmount) && $billing->usageSurgeAmount) 
            {
                $usageSurgeAmount = $billing->usageSurgeAmount;
            }
            if (isset($billing->usageSurgePercentage) && $billing->usageSurgePercentage) 
            {
                $usageSurgePercentage = $billing->usageSurgePercentage;
            }
            if (isset($billing->daySurgeAmount) && $billing->daySurgeAmount) 
            {
                $daySurgeAmount = $billing->daySurgeAmount;
            }
            if (isset($billing->daySurgePercentage) && $billing->daySurgePercentage) 
            {
                $daySurgePercentage = $billing->daySurgePercentage;
            }
            if (isset($billing->dateSurgeAmount) && $billing->dateSurgeAmount) 
            {
                $dateSurgeAmount = $billing->dateSurgeAmount;
            }
            if (isset($billing->dateSurgePercentage) && $billing->dateSurgePercentage) 
            {
                $dateSurgePercentage = $billing->dateSurgePercentage;
            }
            if (isset($billing->areaSurgeAmount) && $billing->areaSurgeAmount) 
            {
                $areaSurgeAmount = $billing->areaSurgeAmount;
            }
            if (isset($billing->areaSurgePercentage) && $billing->areaSurgePercentage) 
            {
                $areaSurgePercentage = $billing->areaSurgePercentage;
            }
            if (isset($billing->callCenterSurgeAmount) && $billing->callCenterSurgeAmount) 
            {
                $callCenterSurgeAmount = $billing->callCenterSurgeAmount;
            }
            if (isset($billing->callCenterSurgePercentage) && $billing->callCenterSurgePercentage) 
            {
                $callCenterSurgePercentage = $billing->callCenterSurgePercentage;
            }
            if (isset($billing->extraSurgeAmount) && $billing->extraSurgeAmount) 
            {
                $extraSurgeAmount = $billing->extraSurgeAmount;
            }
            if (isset($billing->extraSurgePercentage) && $billing->extraSurgePercentage) 
            {
                $extraSurgePercentage = $billing->extraSurgePercentage;
            }


            $differentBookingSurges = new BookingSurgeParameter;
            $differentBookingSurges->booking_id = $booking->id;
            $differentBookingSurges->usage_surge_percent = $usageSurgePercentage;
            $differentBookingSurges->usage_surge_amount = $usageSurgeAmount;
            $differentBookingSurges->day_surge_percent = $daySurgePercentage;
            $differentBookingSurges->day_surge_amount = $daySurgeAmount;
            $differentBookingSurges->date_surge_percent = $dateSurgePercentage;
            $differentBookingSurges->date_surge_amount = $dateSurgeAmount;
            $differentBookingSurges->area_surge_percent = $areaSurgePercentage;
            $differentBookingSurges->area_surge_amount = $areaSurgeAmount;
            $differentBookingSurges->callcenter_surge_percent = $callCenterSurgePercentage;
            $differentBookingSurges->callcenter_surge_amount = $callCenterSurgeAmount;
            $differentBookingSurges->extra_surge_percent = $extraSurgePercentage;
            $differentBookingSurges->extra_surge_amount = $extraSurgeAmount;
            $differentBookingSurges->created_at =  date("Y-m-d H:i:s");
            $differentBookingSurges->updated_at = date("Y-m-d H:i:s");
            $differentBookingSurges->save();
        }

        if(!empty($booking->id) && $booking->book_later == 0)
        {
            $baseUrl = url('/');
            $url= $baseUrl."/api/allot-auto-booking?bookingID=".$booking->id;
            $this->backgroundAllotment($url);
        }
        return $booking;
        

    }

    # Function : This function is used Update Booking 
    # Request : Booking Id, Customer Info, Booking Payment
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : Vinod, Brijendra
    public function updateBooking(Request $request, $id)
    {   
        $distancePercentage = 0;
        $customer = NULL;
        $pick     = NULL;
        $drop     = NULL; 
        $vehicle  = NULL;
        $info     = NULL;
        $billing  = NULL;
        $totalTripCharge = 0;
        $discountAmount  = 0;
        $customerID = NULL;
        $bookingIDE = NULL;
        $customerId = NULL;

        $data = $request->all();  

        $payment='post';
        if(isset($data['payment']) && ($data['payment']!=''))
        {
            $payment = $data['payment'];
        }  
        
        $bookingStatus = BookingStatus::where('booking_id',$id)->orderBy('id','desc')->first();
        if($bookingStatus != "")
        {

            if ($payment == 'post' && $bookingStatus->billing_time != '') 
            {
                $array['error']   = 1;
                $array['message'] = "booking can not be updated";
                return  $array;
                exit();
            }
            if ($payment == 'pre' && $bookingStatus->loading_time != "") 
            {
                $array['error']   = 1;
                $array['message'] = "booking can not be updated";
                return  $array;
                exit();
            }
        }

        $allotedDriverId = 0;
        //check booking alloted
        if (isset($data['alloted_booking_driver']) && $data['alloted_booking_driver'] != 0) 
        {
            $allotedDriverId = $data['alloted_booking_driver'];
        }
        //pick detials check
        if(isset($data['pick']))
        {
            $pick = json_decode($data['pick']);    
        }
        
        //drop detials check
        if(isset($data['drop']))
        {
            $drop = json_decode($data['drop']);    
        }

        //vehicle detials check
        if(isset($data['vehicle']))
        {
            $vehicle = json_decode($data['vehicle']);    
            $distancePercentage = $vehicle->distance_buffer_percentage;
            $distanceLowerPercentage = $vehicle->lower_distance_buffer;  
        }

        //info detials check
        if(isset($data['info']))
        {
            $info = json_decode($data['info']);    
        } 
         //billing detials check
        if(isset($data['billing']))
        {
            $billing = json_decode($data['billing']); 
        } 
        
        if(isset($data['customer']))
        {
            $customer = json_decode($data['customer']);  
            $getCustomer = Customer::select('id')->where('cust_number',$customer->cust_number)->first();
            $customerID   = $getCustomer->id;
            $cityId   = $getCustomer->city_id;
            
        }
        //billing detials check
        if(isset($data['billing']))
        {
            $billing = json_decode($data['billing']); 
            
            //pod check
            if(isset($billing->pod) && $billing->pod == true)
            {
                $resultArray['pod'] = true;    
            }
            else
            {
                $resultArray['pod'] = false;    
            }
           
            //unloading check
            if(isset($billing->tick_unloading) && $billing->tick_unloading == true)
            {
                $resultArray['unloading'] = true;    
            }
            else
            {
                $resultArray['unloading'] = false;    
            }
            
            //chcek loading
            if(isset($billing->tick_loading) && $billing->tick_loading == true)
            {
                $resultArray['loading'] = true;    
            }
            else
            {
                $resultArray['loading'] = false;
            }
        }
        
        $resultArray['estimated_distance'] = 0;
        $resultArray['lower_estimated_distance'] = 0;
        if(isset($billing->buffer_estimated_distance)) 
        {
            $lowerDistance   = $billing->buffer_estimated_distance;
            $distance = $billing->estimated_distance;
            $resultArray['estimated_distance'] = $distance;
            $resultArray['lower_estimated_distance'] = $lowerDistance;
        }

        if(isset($billing->fixedamount) && $billing->fixedamount !=0) 
        {
            $resultArray['trip_charge'] = $billing->fixedamount;
        }
        else if(isset($billing->hourly_fare) && $billing->hourly_fare != 0)
        {
            $resultArray['trip_charge'] = $billing->trip_charge;
        }
        else
        {
            $mainDistance = $distance - $vehicle->base_distance;
            if($mainDistance > 0)
            {
                $mainDistance = $distance - $vehicle->base_distance;
            }
            else
            {
                $mainDistance = 0;
            }
            $totalTripCharge = round($totalTripCharge + ($vehicle->base_fare + ($vehicle->rate * $mainDistance)));
            $resultArray['trip_charge'] = round($totalTripCharge);

            $totalTripCharge1 = 0;
            $mainDistance1 = $lowerDistance - $vehicle->base_distance;
            if($mainDistance1 > 0)
            {
                $mainDistance1 = $lowerDistance - $vehicle->base_distance;
            }
            else
            {
                $mainDistance1 = 0;
            }
            $totalTripCharge1 = round($totalTripCharge1 + ($vehicle->base_fare + ($vehicle->rate * $mainDistance1)));
            $resultArray['lower_trip_charge'] = round($totalTripCharge1);
        }
        
        //drop point charge calculation
        if(isset($info->no_of_drop_points))
        {
            if($vehicle->allowed_drop_point < $info->no_of_drop_points)
            {
                //if drop point are greater then allowed then add drop point charge
                $dropPoint = $info->no_of_drop_points - $vehicle->allowed_drop_point;
                $totalTripCharge = $totalTripCharge + ($dropPoint * $vehicle->rate_per_drop_point);
                $resultArray['drop_point_charge'] = ($dropPoint * $vehicle->rate_per_drop_point);
            }
            else 
            {
                $totalTripCharge = $totalTripCharge + 0.00;
                $resultArray['drop_point_charge'] = 0.00;
            }
        }
        else 
        {
            $totalTripCharge = $totalTripCharge + 0.00;
            $resultArray['drop_point_charge'] = 0.00;
        }
        
        if(isset($billing->tick_loading))
        {
            if($billing->tick_loading == true)
            {
                $totalTripCharge = $totalTripCharge + $billing->loading_charge;
                $resultArray['loading_charge']   = $billing->loading_charge;
            }
            else
            {
                $resultArray['loading_charge']   = 0;
            }
        }
        else
        {
            $resultArray['loading_charge']   = 0;
        }
        
        if(isset($billing->tick_unloading))
        {
            if($billing->tick_unloading == true)
            {
                $totalTripCharge = $totalTripCharge + $billing->unloading_charge;
                $resultArray['unloading_charge'] = $billing->unloading_charge;
            }
            else
            {
                $resultArray['unloading_charge'] = 0;   
            }
        }
        else
        {
            $resultArray['unloading_charge'] = 0;   
        }

        if(isset($billing->pod) && $billing->pod == true)
        {   
            $totalTripCharge = $totalTripCharge + $vehicle->pod_charge;
            $resultArray['pod_charge'] = $vehicle->pod_charge;
        }
        else
        {
            $resultArray['pod_charge'] = 0;
        }

        //calculating customer discount
        if(isset($billing->discount_amount)) 
        {
            if($billing->discount_amount != 0)
            {
                $resultArray['discount_amount'] = $billing->discount_amount;
                $discountAmount                 = $billing->discount_amount;
                $resultArray['discount'] = 0;
            }
            else
            {
                $resultArray['discount_amount'] = 0;
                $discountAmount                 = 0;
                $resultArray['discount']        = 0;
            }
        }
        else 
        {
                $resultArray['discount_amount'] = 0;
                $discountAmount                 = 0;
                $resultArray['discount'] = 0;
        }
        $navigation = false;
        if(isset($data['info']))
        {
            $info = json_decode($data['info']);  
            if(isset($info->flagCustomer))
            {
                if($info->flagCustomer == 1)    
                {
                    $navigation = true;
                }
                else
                {
                    $navigation = false;
                }
            }   
        }
        
        $resultArray['final_amount'] = $totalTripCharge - $discountAmount;
        $booking                     = Booking::find($id);
        $booking->customer_id        = $customerID;
        $booking->vehicle_id         = $vehicle->id;
        if(isset($billing->discount_code_id))
        {
            $booking->discount_coupon_id = $billing->discount_code_id;
        }
        else
        {
            $booking->discount_coupon_id = 0;
        }
        if(isset($info->notes))
        {
            $booking->notes = $info->notes;    
        }
        else
        {
            $booking->notes = "";
        }
        
        if(isset($info->booking_schedule_time))
        {
            $booking->requirement_time = date('Y-m-d H:i:s',(strtotime($info->booking_schedule_time)));    
        }
        else
        {
            $booking->requirement_time = date('Y-m-d H:i:s',$bookingScheduleTime);
        }
        
        if(isset($info->no_of_drop_points))
        {
            $booking->drop_points = $info->no_of_drop_points;    
        }
        else
        {
            $booking->drop_points = 1;
        }
        if(isset($info->type_of_goods))
        {
            $booking->goods_id = $info->type_of_goods;    
        }

        $good = '';
        if($info->type_of_goods!='') 
        { 
            $good = GoodsType::find($info->type_of_goods);
        }
 
        if($good!='') 
        {
            $goodType = $good->goods_name;
        }
        else
        {
            $goodType = '';
        }
        if($goodType == 'Others')
        {
            if(isset($info->other_good))
            {
            	$other_good = $info->other_good;   
            	$booking->other_goods_text = $other_good;    
            }
        } 

        if(isset($info->allotment_type) && $info->allotment_type == 'yes')
        {
            $booking->allotment_type = 1;
        }
        if(isset($billing->tick_loading) && $billing->tick_loading == true)
        {
           $loading = 1;
        }
        else
        {
            $loading = 0;
        }
        if(isset($billing->tick_unloading) && $billing->tick_unloading == true)
        {
           $unloading = 1;
        }
        else
        {
            $unloading = 0;
        }
        $employeeId = Auth::user()->id;
        $booking->updated_by                = $employeeId;
        $booking->payment_option            = $payment;  
        $booking->loading_required          = $loading;
        $booking->unloading_required        = $unloading;
        $booking->navigation_required       = $navigation;
        $billingType = BillingType::where('type',$billing->booking_type)->first();
        $booking->customer_pricing_id       = $billingType->id;
        $booking->driver_pricing_id         = $billingType->id;
        $booking->current_status            = 'booked';
        $booking->waiting_time              = 0; 
        $booking->trip_time                 = $billing->estimated_trip_time;
        $booking->upper_trip_distance       = $distance;
        $booking->estimate_upper_trip_distance  = $distance;
        if($booking->upper_trip_distance == 0)
        {
            $booking->upper_trip_distance  = $booking->estimate_upper_trip_distance;
        }
        $booking->lower_trip_distance       = $lowerDistance;
        
        if(isset($billing->covered_status) && $billing->covered_status == 'yes')
        {
            $booking->covered_required = "1";
        }
        if(isset($billing->covered_status) && $billing->covered_status == 'no')
        {
            $booking->covered_required = "0";
        }
        if(isset($billing->e_pod) && $billing->e_pod == 'true')
        {
            $booking->e_pod_required = "1";
        }
        else
        {
            $booking->e_pod_required = "0";
        }
        if(isset($billing->pod) && $billing->pod == 'true')
        {
            $booking->phy_pod_required = "1";
        }
        else
        {
            $booking->phy_pod_required = "0";
        }
        if(isset($billing->book_later) && $billing->book_later == 'true')
        {
            $booking->book_later = 1;
        }
        if ($billing->booking_type == 'hourly') 
        {
            if(isset($billing->approximatelyHours))
            {
                $booking->approximately_hours  = $billing->approximatelyHours;
            }
            else
            {
                $booking->approximately_hours  = 0;
            }    
        }
        $booking->updated_at = date('Y-m-d H:i:s');
        $booking->save();
        $bookingId  = $booking->id;
        $bookingCustomerDetails =  BookingCustomerDetails::where('booking_id',$bookingId)->first();
        $bookingDriverDetails =  BookingDriverDetails::where('booking_id',$bookingId)->first();
        $bookingDriverDetails->booking_id = $bookingId;
        $bookingCustomerDetails->booking_id = $bookingId;
        if(isset($resultArray['lower_trip_charge']))
        {
            $bookingCustomerDetails->lower_trip_charge     = $resultArray['lower_trip_charge']; 
            $bookingDriverDetails->lower_trip_charge       = $resultArray['lower_trip_charge']; 
        }
        
        if(isset($resultArray['trip_charge']))
        {
            $bookingCustomerDetails->trip_charge = $resultArray['trip_charge'];  
            $bookingDriverDetails->trip_charge = $resultArray['trip_charge'];
            $bookingCustomerDetails->estimate_upper_trip_charge = $resultArray['trip_charge'];  
            $bookingDriverDetails->estimate_upper_trip_charge = $resultArray['trip_charge'];
        }
                
        if($billing->tick_unloading == true)
        {
            $bookingCustomerDetails->unloading_charge = $resultArray['unloading_charge']; 
            $bookingDriverDetails->unloading_charge = $resultArray['unloading_charge'];   
        }
        else
        {
            $bookingCustomerDetails->unloading_charge = 0;   
            $bookingDriverDetails->unloading_charge = 0;
        }

        if($billing->tick_loading == true)
        {
            $bookingCustomerDetails->loading_charge = $resultArray['loading_charge']; 
            $bookingDriverDetails->loading_charge   = $resultArray['loading_charge']; 
        }
        else
        {
            $bookingCustomerDetails->loading_charge = 0;
            $bookingDriverDetails->loading_charge   = 0;    
        }
        
        if(isset($billing->pod) && $billing->pod == 'true')
        {
           $bookingCustomerDetails->pod_charge = $vehicle->pod_charge;
        }
        else
        {
            $bookingCustomerDetails->pod_charge = "0"; 
        }

        if(isset($billing->totalSurgeAmount))
        {
            $bookingCustomerDetails->estimate_surge_charge = $billing->totalSurgeAmount;
        } 
        else 
        {
            $bookingCustomerDetails->estimate_surge_charge = 0;
        }

        if(isset($billing->totalSurgePercentage))
        {
            $bookingCustomerDetails->surge_percentage = $billing->totalSurgePercentage;
        } 
        else 
        {
            $bookingCustomerDetails->surge_percentage = 0;
        }
        if(isset($resultArray['discount_amount']))
        {
            $bookingCustomerDetails->estimate_discount_amount = $resultArray['discount_amount'];
        }
        else
        {
            $bookingCustomerDetails->estimate_discount_amount = 0;
        }

        $bookingDriverDetails->drop_points_charge    = $resultArray['drop_point_charge'];
        $bookingCustomerDetails->drop_points_charge    = $resultArray['drop_point_charge'];
        $mgBonus = 0;
        $mgBonusPercentage = 0;
        if($bookingCustomerDetails->estimate_surge_charge != 0)
        {
            $tripAmount = $bookingCustomerDetails->trip_charge + $bookingCustomerDetails->loading_charge + $bookingCustomerDetails->unloading_charge + $bookingCustomerDetails->pod_charge + $bookingCustomerDetails->drop_points_charge;
            $commonFunction = new CommonFunctionController;
            $driverSurgeData = $commonFunction->driverSurgeCalculation($customerID, $vehicle->id, $tripAmount);
            
            $mgBonus = $driverSurgeData['estimate_driver_surge_charge'];
            $mgBonusPercentage = $driverSurgeData['estimate_driver_surge_percentage']; 
        }
        $bookingDriverDetails->estimate_driver_surge_charge  = $mgBonus;
        $bookingDriverDetails->estimate_driver_surge_percentage  = number_format($mgBonusPercentage, 1, '.', ''); 
        $bookingDriverDetails->save();
        $bookingCustomerDetails->save();
       
        if(isset($billing->discount_amount) && $billing->discount_amount > 0)
        {
            $discountCodeId = $billing->discount_code_id;
            $code = BookingDiscountCode::where('booking_id',$bookingId)->first();
            if($code != '')
            {
                $code->booking_id = $bookingId;
                $code->customer_id = $customerID;
                $code->discount_coupon_id = $discountCodeId;
                $code->created_at = date('Y-m-d H:i:s');
                $code->save();
                $discountId = $code->id;
            }
        } 
        else
        {
            $code = BookingDiscountCode::where('booking_id',$bookingId)->first();
            if($code != '')
            {
                $code->delete();
            }
        }
       
        $employeeId = Auth::user()->id;

        $commonFunction = new CommonFunctionController;
        $commonFunction->addEmployeeAllotmentDashBoard($booking->id,'booked',$employeeId);

        $specialFunction = new CommonFunctionController;
        $specialFunction->setBookingStatus($booking->id, "booked", strtotime($info->booking_schedule_time));
        
        $favoriteLocation =  FavoriteLocation::where('booking_id',$booking->id)->first();
        $favoriteLocation->customer_id         =  $customerID;
        $favoriteLocation->employee_id         = Auth::user()->id;
        $favoriteLocation->booking_id          =  $booking->id;
        $favoriteLocation->pickup_number       =  $pick->pickup_number;
        $favoriteLocation->pickup_location     =  $pick->pickup_location;
        $favoriteLocation->pickup_landmark     =  $pick->pickup_landmark;
        $favoriteLocation->pickup_lat          =  $pick->lat;
        $favoriteLocation->pickup_lng          =  $pick->lng;
        $favoriteLocation->drop_number         =  $drop->drop_number; 
        $favoriteLocation->drop_location       =  $drop->drop_location;
        $favoriteLocation->drop_landmark       =  $drop->drop_landmark;
        $favoriteLocation->drop_lat            =  $drop->lat;
        $favoriteLocation->drop_lng            =  $drop->lng;
        $favoriteLocation->save();

        if(isset($data['multipleDrop']))
        {
            $multipleDropPoints = $data['multipleDrop'];  
            $multipleDropPoints = json_decode($multipleDropPoints,true);
            $countArray = $multipleDropPoints['longitude'];
            $count = sizeof($countArray);
            CustomerDropPoints::where('booking_id',$booking->id)->delete();           
            $newArray = array();
            for ($i=0; $i < $count ; $i++) 
            { 
                $landmark = $multipleDropPoints['landmark'][$i];
                $longitude = $multipleDropPoints['longitude'][$i];
                $latitute = $multipleDropPoints['latitute'][$i];
                $multipleDrop                      =  new CustomerDropPoints;
                $multipleDrop->customer_id         =  $customerID;
                $multipleDrop->booking_id          =  $bookingId;
                $multipleDrop->drop_number         =  ''; 
                $multipleDrop->drop_landmark       =  $landmark;
                $multipleDrop->drop_lat            =  $latitute;
                $multipleDrop->drop_lng            =  $longitude;
                $multipleDrop->is_favourite        =  0;
                $multipleDrop->save();
            }
        }

        $differentBookingSurges = BookingSurgeParameter::where('booking_id', $bookingId)->first();
        if($differentBookingSurges != "")
        {

            $usageSurgeAmount = 0;
            $usageSurgePercentage = 0;
            $daySurgeAmount = 0;
            $daySurgePercentage = 0;
            $dateSurgeAmount = 0;
            $dateSurgePercentage = 0;
            $areaSurgeAmount = 0;
            $areaSurgePercentage = 0;
            $callCenterSurgeAmount = 0;
            $callCenterSurgePercentage = 0;
            $extraSurgeAmount = 0;
            $extraSurgePercentage = 0;

            if (isset($billing->usageSurgeAmount) && $billing->usageSurgeAmount) {
                $usageSurgeAmount = $billing->usageSurgeAmount;
            }
            if (isset($billing->usageSurgePercentage) && $billing->usageSurgePercentage) {
                $usageSurgePercentage = $billing->usageSurgePercentage;
            }
            if (isset($billing->daySurgeAmount) && $billing->daySurgeAmount) {
                $daySurgeAmount = $billing->daySurgeAmount;
            }
            if (isset($billing->daySurgePercentage) && $billing->daySurgePercentage) {
                $daySurgePercentage = $billing->daySurgePercentage;
            }
            if (isset($billing->dateSurgeAmount) && $billing->dateSurgeAmount) {
                $dateSurgeAmount = $billing->dateSurgeAmount;
            }
            if (isset($billing->dateSurgePercentage) && $billing->dateSurgePercentage) {
                $dateSurgePercentage = $billing->dateSurgePercentage;
            }
            if (isset($billing->areaSurgeAmount) && $billing->areaSurgeAmount) {
                $areaSurgeAmount = $billing->areaSurgeAmount;
            }
            if (isset($billing->areaSurgePercentage) && $billing->areaSurgePercentage) {
                $areaSurgePercentage = $billing->areaSurgePercentage;
            }
            if (isset($billing->callCenterSurgeAmount) && $billing->callCenterSurgeAmount) {
                $callCenterSurgeAmount = $billing->callCenterSurgeAmount;
            }
            if (isset($billing->callCenterSurgePercentage) && $billing->callCenterSurgePercentage) {
                $callCenterSurgePercentage = $billing->callCenterSurgePercentage;
            }
            if (isset($billing->extraSurgeAmount) && $billing->extraSurgeAmount) {
                $extraSurgeAmount = $billing->extraSurgeAmount;
            }
            if (isset($billing->extraSurgePercentage) && $billing->extraSurgePercentage) {
                $extraSurgePercentage = $billing->extraSurgePercentage;
            }

            $differentBookingSurges->usage_surge_percent = $usageSurgePercentage;
            $differentBookingSurges->usage_surge_amount = $usageSurgeAmount;
            $differentBookingSurges->day_surge_percent = $daySurgePercentage;
            $differentBookingSurges->day_surge_amount = $daySurgeAmount;
            $differentBookingSurges->date_surge_percent = $dateSurgePercentage;
            $differentBookingSurges->date_surge_amount = $dateSurgeAmount;
            $differentBookingSurges->area_surge_percent = $areaSurgePercentage;
            $differentBookingSurges->area_surge_amount = $areaSurgeAmount;
            $differentBookingSurges->callcenter_surge_percent = $callCenterSurgePercentage;
            $differentBookingSurges->callcenter_surge_amount = $callCenterSurgeAmount;
            $differentBookingSurges->extra_surge_percent = $extraSurgePercentage;
            $differentBookingSurges->extra_surge_amount = $extraSurgeAmount;
            $differentBookingSurges->created_at =  date("Y-m-d H:i:s");
            $differentBookingSurges->updated_at = date("Y-m-d H:i:s");
            $differentBookingSurges->save();
        }

        if($allotedDriverId != 0)
        {
            $baseUrl = url('/');

            $url= $baseUrl."/api/editBookingSendNotification?booking_id=".$id."&driver_id=".$allotedDriverId."&auto_flag=1&schedule_time_edit=0&pickup_address_edit=0&drop_address_edit=1&type_of_booking_edit=1&loading_edit=1&unloading_edit=1&payment_method_edit=0&pod_edit=1&number_of_drop_point_edit=1"; 

            $this->backgroundAllotment($url);
        }
        
        return $booking;
    }


    # Function : This function is used Allot booking after modify or add 
    # Request : Booking Id
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : Vinod
    function backgroundAllotment($url)
    { 
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

    # Function : This function is used get single Booking detials
    # Request : Booking Id
    # Response : Json message
    # Author : Vinod Gami
    # Modify By : Vinod, Brijendra, Rahul
   

    public function viewBooking($id)
    { 
        $emplyoeeAllotedDetials = NULL;
        $result                      = Booking::where('id', $id)->first();
        if($result == '')
        {
            $response = array();
            $response['error']['message'] = "No record found";
            return $response;
        }
        $result['booking_eta'] = 'NA';
        $bookingEta = BookingEta::where('booking_id', $id)->first();
        if($bookingEta)
        {
            $result['booking_eta'] = round($bookingEta->estimate_eta , 2);
        }

        $bookingCityId = $result->city_id;
        $result['setting_details'] = array();
        if($bookingCityId)
        {
            $maalgaadiSettingDetails = MaalgaadiSettings::select('maalgaadi_address','maalgaadi_email','customer_care_contact')->where('city_id', $bookingCityId)->first();
            $result['setting_details'] = $maalgaadiSettingDetails;
        }


        $result['alloted_driver_schedule_time'] = $result->requirement_time;

        //true shows enable value
        //false shows disabled value
        $result['schedule_time_edit']   = true; 
        $result['pickup_address_edit']  = true; 
        $result['drop_address_edit']    = true; 
        $result['booking_type_edit']    = true;
        $result['loading_edit']         = true;
        $result['unloading_edit']       = true;
        $result['payment_method_edit']  = true;
        $result['pod_edit']             = true;
        $result['number_of_drop_point_edit'] = true;
        $result['is_goods_type_edit']   = true;
        $result['all_edit']             = true;
        $result['is_contact_edit']      = true;
        $result['is_tip_edit']          = true;
        $result['is_vehicle_edit']      = true;
        $result['is_fav_driver_edit']   = true;
        $result['customer_details_edit'] = false;
        
        $bookingStatus = BookingStatus::where('booking_id',$id)->first();
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
                $result['booking_type_edit'] = false;
                $result['loading_edit'] = false;
                $result['pod_edit'] = false;
                $result['number_of_drop_point_edit'] = false;
                $result['all_edit'] = false;
                $result['unloading_edit'] = false;
            }
            if($result->payment_option == 'pre' && $bookingStatus->loading_time != '')
            {
                $result['schedule_time_edit'] = false; 
                $result['drop_address_edit'] = false; 
                $result['booking_type_edit'] = false;
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


            if($result->payment_option == 'post'  && $bookingStatus->billing_time == '' )
            {
                $result['unloading_edit'] = true;
            }
            
        }
        if ($result->driver_id != 0) 
        {

            $driverLoginDetials = DriverDetials::where('driver_id', $result->driver_id)->orderBy('id', 'desc')->first();
            if ($driverLoginDetials != "") 
            {
                if ($driverLoginDetials->loading_unloading_status != 'yes') 
                {
                    $result['loading_edit'] = false;
                    $result['unloading_edit'] = false;
                }
                
            }
        }


        $bookingCustomerDetails      = BookingCustomerDetails::where('booking_id', $result->id)->first();
        $bookingDriverDetails        = BookingDriverDetails::where('booking_id', $result->id)->first();
        $result['booking_driver_details'] = $bookingDriverDetails;
        $billingType = BillingType::find($result->driver_pricing_id);
        $result['booking_driver_details']['billing_type'] = ucfirst($billingType->type);

        $result['booking_driver_details']['dtc_charge'] = 0;
        $result['booking_driver_details']['commission'] = 0;
        $result['booking_driver_details']['driver_earning_payment'] = 0;
        $driverWalletDetails = DriverWallet::where('booking_id', $id)->get();
        if($driverWalletDetails)
        {
            foreach ($driverWalletDetails as $key => $value) 
            {
                if($value->remark == 'DTC Charges')
                {
                    $result['booking_driver_details']['dtc_charge'] = $value->credit;
                }
                if($value->remark == 'Commission')
                {
                    $result['booking_driver_details']['commission'] = $value->debit;
                }

                if($value->remark == '')
                {
                    $result['booking_driver_details']['driver_earning_payment'] = $value->debit;
                }

            }
            
        }
        
        if($result != "")
        {
            $emplyoeeAllotedDetials      = User::select('name')->find($result->alloted_to_id);   
            $emplyoeeAllotedDetialsWhoAllot = User::select('name')->find($result->allotment_by);
        }
        if($result->employee_id == 0)
        {
            $result->employee_id = 1;
        }

        $emplyoeeDetials      = User::select('name')->find($result->employee_id);
        $customerDetials      = Customer::find($result->customer_id);
        $driverDetials        = Driver::find($result->driver_id);
        $result['book_schedule_time'] = strtotime($result->requirement_time);
        $result['booking_schedule_time'] = strtotime($result->requirement_time);
        $result['created_at'] = date('d-m-Y H:i:s', strtotime($result->created_at));

        $result['discount_code_id'] = '';
        $result['discount_code'] = '';
        $getCode = BookingDiscountCode::where('booking_id',$id)->first();
        if(count($getCode) > 0)
        {
            $discountData = DiscountCouponCode::where('id',$getCode->discount_coupon_id)->first();
            $result['discount_code_id'] = $discountData->id;
            $result['discount_code'] = $discountData->discount_code;
        }
        else
        {
            $result['discount_code_id'] = '';
            $result['discount_code'] = 'NA';
        }
        $upperTripDistance = $result->upper_trip_distance;
        $distance = $result->actual_trip_distance;
        $lowerTripDistance = $result->lower_trip_distance;

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
        $result['billling_distance']  = $distanceInMeter1/1000;

        $dt = date('Y-m-d');
        if($result->driver_id != 0 && $result->driver_id != '-1')
        {
            $driverRating = DriverRating::where('driver_id', $result->driver_id)->where('rate_date', $dt)->first();
            if($driverRating != "")
            {
                $driverDetials->driver_rating="(".$driverRating->rate.")";  
            }
        }
        $goods = '';
        if($result->goods_id!='')
        {
            $goods = GoodsType::select('goods_name')->where('id',$result->goods_id)->first();
        } 
        $goods_name = '';  
        if($goods != '')
        {
            $goods_name = $goods->goods_name;
        }
        $result['type_of_goods'] = $goods_name;
        
        $result['goods_name'] = $goods_name;
        $result['employeeName'] = $emplyoeeDetials->name;
        
        $favoriteLocation     = FavoriteLocation::where('booking_id', $result->id)->first();
        $vehicle              = Vehicle::find($result->vehicle_id);
        $vehicelMeta          = VehicleGood::where('vehicle_id',$result->vehicle_id)->where('good_id',$result->goods_id)->first();
                
        if($vehicelMeta != '')
        {
            $vehicle->loading_charge = $vehicelMeta->loading_charge;
            $vehicle->unloading_charge = $vehicelMeta->unloading_charge;
        }
        else
        {
            $vehicle->loading_charge = $bookingCustomerDetails->loading_charge;
            $vehicle->unloading_charge = $bookingCustomerDetails->unloading_charge;
        }

        $baseUrl = Config::get('constants.url');
        if($result->driver_id != 0 && $result->driver_id != '-1')
        {
            $driverLoginDetials     = DriverDetials::where('driver_id', $result->driver_id)->first();
            
            $vehicleRegistrationNo = $driverDetials->vehicle_reg_no;
            $firstVisitDetails = FirstVisit::where('registration_no', $vehicleRegistrationNo)->orderBy('id','DESC')->first();
            if($firstVisitDetails)
            {
                $firstVisitDriver = $firstVisitDetails->id;
                $driverOnBoardingDetails = DriverOnBoarding::select('driver_photo')->where('driver_id', $firstVisitDriver)->first();
                if($driverOnBoardingDetails)
                {
                    $driverImageUrl = $baseUrl.''.$driverOnBoardingDetails->driver_photo;
                    if (file_exists($_SERVER['DOCUMENT_ROOT'].$driverOnBoardingDetails->driver_photo)) 
                    {   
                        $driverDetials->driver_image = $driverImageUrl;
                    }
                    else
                    {
                        $driverDetials->driver_image = '';
                    }
                }
                else
                {
                    $driverDetials->driver_image = '';
                }
            }
            else
            {
                $driverDetials->driver_image = '';
            }
            $vehicledata = Vehicle::where('id', $driverDetials->vehicle_category_id)->first();
            $driverAvgRating = AverageRating::where('user_id', $driverDetials->id)->where('user_type','driver')->orderBy('id','DESC')->first();
            if($driverAvgRating)
            {
                $driverDetials->average_rating = $driverAvgRating->average_rating;
            }
            else
            {
                $driverDetials->average_rating = 5;
            }
            $driverDetials->vehicle_name = $vehicledata->vehicle_name;
            preg_match_all('/\b\w/', $vehicledata->vehicle_name, $match);
            $driverDetials->mg_id .= '('.implode($match[0]).')';
            if(isset($driverLoginDetials->covered_status) )
            {
                if($driverLoginDetials->covered_status == 'yes')
                {
                   
                   $driverDetials->mg_id .= ' (C) ';  

                }
                else
                {
                   $driverDetials->mg_id .= ' (UC) ';  
                   
                }
            }
            else
            {
            $driverDetials->mg_id .= ' (UC) ';  

            }

            if(isset($driverLoginDetials->helper_status))
            {
                if($driverLoginDetials->helper_status == "yes")
                {
                    $driverDetials->mg_id .= ' (H) ';   
                }
                else
                {
                    if(isset($driverLoginDetials->loading_unloading_status))
                    {
                        if($driverLoginDetials->loading_unloading_status == "yes")
                        {
                            $driverDetials->mg_id .= ' (L/UL) ';    
                        }
                        else
                        {
                            $driverDetials->mg_id .= ' (WL/WUL) ';
                        }
                    }
                    else
                    {
                        $driverDetials->mg_id .= ' (WL/WUL) ';
                    }
                }
            }
            else
            {
                if(isset($driverLoginDetials->loading_unloading_status))
                {
                    $value->load_status = $driverLoginDetials->loading_unloading_status;
                    if($driverLoginDetials->loading_unloading_status == "yes")
                    {
                        $driverDetials->mg_id .= ' (L/UL) ';    
                    }
                    else
                    {
                        $driverDetials->mg_id .= ' (WL/WUL) ';
                    }
                }
                else
                {
                    $driverDetials->mg_id .= ' (WL/WUL) ';
                }
            }
        }
        else if($result->driver_id == '-1' && $result->mg_code != "")
        {
            $driverDetials           = Driver::where('mg_id', $result->mg_code)->first();
            $driverAvgRating = AverageRating::where('user_id', $driverDetials->id)->where('user_type','driver')->orderBy('id','DESC')->first();
            if($driverAvgRating)
            {
                $driverDetials->average_rating = $driverAvgRating->average_rating;
            }
            else
            {
                 $driverDetials->average_rating = 5;
            }
            $vehicledata = Vehicle::where('id', $driverDetials->vehicle_category_id)->first();
            $driverDetials->vehicle_name = $vehicledata->vehicle_name;
            $driverDetials->cancelled = "Cancelled";
            $cancelBookingDetials     = CancelBooking::where('booking_id', $result->id)->first();
            $driverDetials->cancelled_detials = $cancelBookingDetials;

            if($cancelBookingDetials)
            {
                $cancelEmployeeId = $cancelBookingDetials->employee_id;
                $cancellationBy = User::select('name')->find($cancelEmployeeId);
                if($cancellationBy)
                {
                    $driverDetials['cancelled_by'] = $cancellationBy->name;
                }
                else
                {
                    $driverDetials['cancelled_by'] = "NA";
                }
            }
            else
            {
                $driverDetials['cancelled_by'] = "NA";
            }
            

            $vehicleRegistrationNo = $driverDetials->vehicle_reg_no;
            $firstVisitDetails = FirstVisit::where('registration_no', $vehicleRegistrationNo)->orderBy('id','DESC')->first();
            if($firstVisitDetails)
            {
                $firstVisitDriver = $firstVisitDetails->id;
                $driverOnBoardingDetails = DriverOnBoarding::select('driver_photo')->where('driver_id', $firstVisitDriver)->first();
                if($driverOnBoardingDetails)
                {
                    $driverImageUrl = $baseUrl.''.$driverOnBoardingDetails->driver_photo;
                    if (file_exists($_SERVER['DOCUMENT_ROOT'].$driverOnBoardingDetails->driver_photo)) 
                    {   
                        $driverDetials->driver_image = $driverImageUrl;
                    }
                    else
                    {
                        $driverDetials->driver_image = '';
                    }
                }
                else
                {
                    $driverDetials->driver_image = '';
                }
            }
            else
            {
                $driverDetials->driver_image = '';
            }
        }
        else
        {
            $driverDetials                    = array();  
            $driverDetials['mg_id']           = 'NA';
            $driverDetials['driver_name']     = 'NA';
            $driverDetials['driver_number']   = 'NA';
            $driverDetials['driver_address']  = 'NA';
            $driverDetials['vehicle_reg_no']  = 'NA';
            $driverDetials['vehicle_name']    = 'NA';
            $driverDetials['average_rating']  = '';
            $driverDetials['driver_image']    = '';
            $cancelBookingDetials             = CancelBooking::where('booking_id', $result->id)->first();
            $driverDetials['cancelled_detials'] = $cancelBookingDetials;   

            if($cancelBookingDetials)
            {
                $cancelEmployeeId = $cancelBookingDetials->employee_id;
                $cancellationBy = User::select('name')->find($cancelEmployeeId);
                if($cancellationBy)
                {
                    $driverDetials['cancelled_by'] = $cancellationBy->name;
                }
                else
                {
                    $driverDetials['cancelled_by'] = "NA";
                }
            }
            else
            {
                $driverDetials['cancelled_by'] = "NA";
            }
        }
        
        $timeDifferance = 0;
        $startDate = NULL;
        $endDate   = NULL;
         
        $creditLimit          = CreditLimit::where('customer_id', $result->customer_id)->first();
        $creditLimitAmount    = 0;
        if(isset($creditLimit->credit_limit))
        {
            $creditLimitAmount = $creditLimit->credit_limit;
            $result['customer_limit'] = $creditLimit->credit_limit;
        }
        $CustomerLedger = CustomerLedger::where('customer_id', $result->customer_id)->orderBy('id', 'desc')->first();
        $CustomerLedgerAmount    = 0;
        if(isset($CustomerLedger->final_balance))
        {
            $result['customer_wallet']    = $CustomerLedger->final_balance;
            $result['new_travelled_time'] = gmdate('m',$result['travelled_time'])." mins ".gmdate('i',$result['travelled_time'])." sec";
            $result['final_balance'] = $CustomerLedger->final_balance;  
        }
        $bookingLogTime = BookingStatus::where('booking_id', $result->id)->first();
        if(isset($bookingLogTime->booking_time) &&  $bookingLogTime->booking_time != '')
        {
            $bookingLogTime->booking_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->booking_time));
        }
        if(isset($bookingLogTime->to_customer_time) &&  $bookingLogTime->to_customer_time != '')
        {
            $bookingLogTime->to_customer_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->to_customer_time));
        }
        if(isset($bookingLogTime->loading_time) &&  $bookingLogTime->loading_time != '')
        {
            $bookingLogTime->loading_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->loading_time));
        }
        if(isset($bookingLogTime->start_time) &&  $bookingLogTime->start_time != '')
        {
            $bookingLogTime->start_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->start_time));
        }
        if(isset($bookingLogTime->stop_time) &&  $bookingLogTime->stop_time != '')
        {
            $bookingLogTime->stop_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->stop_time));
        }
        if(isset($bookingLogTime->billing_time) &&  $bookingLogTime->billing_time != '')
        {
            $bookingLogTime->billing_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->billing_time));
        }
        if(isset($bookingLogTime->pod_time) &&  $bookingLogTime->pod_time != '')
        {
            $bookingLogTime->pod_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->pod_time));
        }
        if(isset($bookingLogTime->complete) &&  $bookingLogTime->complete != '')
        {
            $bookingLogTime->complete = date('d-m-Y H:i:s',strtotime($bookingLogTime->complete));
        }
        if(isset($bookingLogTime->rating) &&  $bookingLogTime->rating != '')
        {
            $bookingLogTime->rating = date('d-m-Y H:i:s',strtotime($bookingLogTime->rating));
        }
        if(isset($bookingLogTime->cancel_time) &&  $bookingLogTime->cancel_time != '')
        {
            $bookingLogTime->cancel_time = date('d-m-Y H:i:s',strtotime($bookingLogTime->cancel_time));
        }
        
        $currentBookingStatus = $bookingLogTime;
        $fy_status     = $result->current_status;      
        
        $bookingStage = $result->current_status;
        if(isset($currentBookingStatus->to_customer_time) && isset($currentBookingStatus->stop_time))
        {
            $date['startDate'] = $currentBookingStatus->to_customer_time;    
            $date['endDate']   = $currentBookingStatus->stop_time;
        }
        
        if(isset($date['endDate']) && isset($date['startDate']))
        {
            $duration = date_diff(date_create(date('Y-m-d H:i:s', strtotime($currentBookingStatus->loading_time))), date_create(date('Y-m-d H:i:s', strtotime($currentBookingStatus->billing_time))));
        }
        
        if(isset($duration))
        {
            $timeDifferance = $duration->format('%h hrs %i min');
        }
        $result['duration']      = $timeDifferance;
        $discountAmount = 0;
        $discountAmountFinal = 0; 
        $result['favorite_location_detials'] = $favoriteLocation;
        $result['vehicle_detials']  = $vehicle;
        $result['customer_detials'] = $customerDetials;
        $result['customer_name']    = $customerDetials->cust_organization;
        $result['cluster_number']   = $customerDetials->cluster_number;
        if($result->current_status == 'completed')
        {
            $result['current_status']   = 'completed';      
        }
        else 
        {
            $result['current_status']   = $fy_status;         
        }
        $result['multiple_drop_points'] =  CustomerDropPoints::where('booking_id',$result->id)->get();
        $multipleDropPoints = $result['multiple_drop_points'];
        $tripRouteDetails          = TripRoute::where('booking_id', $result->id)->first();
        
        $result['tripRouteDetail'] = $tripRouteDetails;
        $result['driverDetials']   = $driverDetials;
        $result['credit_limit']    = $creditLimitAmount;
        $result['bookingLogTime']  = $bookingLogTime;
        if($emplyoeeAllotedDetials != "")
        {
            $result['alloted_to_name'] = $emplyoeeAllotedDetials->name;        
        }
        else
        {
            $result['alloted_to_name']     = "";
        }
        if($emplyoeeAllotedDetialsWhoAllot != "")
        {
            if($emplyoeeAllotedDetialsWhoAllot->name == 'Driver')
            {
                $result['alloted_by'] = 'Self Alloted By Driver';        
            }
            else
            {
                $result['alloted_by'] = $emplyoeeAllotedDetialsWhoAllot->name;        
            }
        }
        else
        {
            $result['alloted_by']     = "";
        }
        $billingType = BillingType::find($result->customer_pricing_id);
        $bookingCustomerDetails->type           = ucfirst($billingType->type);
        $bookingCustomerDetails->payment_option = $result->payment_option;
        $bookingCustomerDetails->loading        = $result->loading_required;
        $bookingCustomerDetails->unloading      = $result->unloading_required;
        $bookingCustomerDetails->covered_status = $result->covered_required;
        $bookingCustomerDetails->pod            = $result->phy_pod_required;
        $bookingCustomerDetails->e_pod          = $result->e_pod_required;
        $bookingCustomerDetails->lower_trip_distance = $result->lower_trip_distance;
        $bookingCustomerDetails->trip_distance = $result->upper_trip_distance;
        $bookingCustomerDetails->actual_trip_distance = $result->actual_trip_distance;
        $bookingCustomerDetails->distance_to_customer = $result->distance_to_customer;
        $bookingCustomerDetails->trip_time = $result->trip_time;
        if($bookingCustomerDetails!= "")
        {
            $result['bookingEstimate']  = $bookingCustomerDetails;  
        }
        if($bookingCustomerDetails != "")
        {
            $result['bookingFinal']  = $bookingCustomerDetails;    
        }
        if(is_null($bookingCustomerDetails->reference_text))
        {
            $result['ref'] = "NA";
        }
        else
        {
            $result['ref'] = $bookingCustomerDetails->reference_text;    
        }
        $result['bookingEstimate']['discount_amount'] = 0;
        $result['bookingEstimate']['discount_amount'] = 0;
        $result['bookingEstimate']['surge_amount'] = 0;
        $result['bookingFinal']['surge_amount'] = 0;
        $result['bookingFinal']['discount_final_amount'] = 0;

        $result['favourite_driver'] = $result->favourite_driver_required;
        if($fy_status != 'completed')
        {
             $result['bookingEstimate']['surge_amount'] = $bookingCustomerDetails->estimate_surge_charge;
             $result['bookingEstimate']['waiting_charge'] = 0;
             $result['bookingEstimate']['discount_amount'] = $bookingCustomerDetails->estimate_discount_amount; 
             $result['bookingEstimate']['total_amount'] = ($bookingCustomerDetails->unloading_charge + $bookingCustomerDetails->loading_charge + $bookingCustomerDetails->pod_charge + $bookingCustomerDetails->drop_points_charge + $bookingCustomerDetails->trip_charge + $bookingCustomerDetails->estimate_surge_charge + $bookingCustomerDetails->tip_charge - $bookingCustomerDetails->estimate_discount_amount);
            
        }
        else
        {
            $result['bookingFinal']['surge_amount'] = $bookingCustomerDetails->actual_surge_charge;
            $result['bookingEstimate']['waiting_charge'] = $bookingCustomerDetails->waiting_time_charge;;
            $result['bookingFinal']['discount_final_amount'] =  $bookingCustomerDetails->actual_discount_amount; 
            $result['bookingFinal']['payment_recevied'] =  $bookingCustomerDetails->payment_recevied; 
            $result['bookingFinal']['total_final_amount'] = ($bookingCustomerDetails->unloading_charge + $bookingCustomerDetails->loading_charge + $bookingCustomerDetails->pod_charge + $bookingCustomerDetails->drop_points_charge + $bookingCustomerDetails->waiting_time_charge + $bookingCustomerDetails->trip_charge + $bookingCustomerDetails->actual_surge_charge + $bookingCustomerDetails->tip_charge - $bookingCustomerDetails->actual_discount_amount);
        }

        $customer    = CustomerLedger::where('booking_id',$id)
                                     ->where('customer_id',$customerDetials->id)
                                     ->first();
        if(isset($customer))
        {
            $customerpre = CustomerLedger::select('id','customer_id','final_balance')
                                         ->where('customer_id',$customer->customer_id)
                                         ->where('id','<',$customer->id)                                               
                                         ->orderBy('id', 'desc')
                                         ->first();            
            
            if($customerpre)
            {
                $result['prev_balance']        = $customerpre['final_balance'];
            }
            else
            {
                $result['prev_balance']        = 0;
            }
            if ($customer) 
            {
                $result['after_balance']       = $customer['final_balance'];
            }
            else
            {
                $result['after_balance']       = 0;                
            }
            $result['customer_booking_payment'] = $customer['credit']; 
        }   
        else
        {
            $result['prev_balance']        = 0;
            $result['after_balance']       = 0;
            $result['customer_booking_payment'] = 0;
        }                          

        $ratingDetials = Rating::where('booking_id', $result->id)->where('user_type','customer')->first();
        if($ratingDetials != "")
        {
            $result['rating_detials'] = $ratingDetials;
        }
        else
        {
            $result['rating_detials'] = "NA";       
        }
        

        //when driver on trip
        $result['on_trip_driver'] = false;
        $result['driver_distance_from_pickup'] = 0;
        if ($result->driver_id != 0 && $result->driver_id != -1 && $bookingStatus->loading_time == "" && $bookingStatus->cancel_time == "")
        {
            $result['on_trip_driver'] = true;

            $driverRegular  = DriverRegular::where('driver_id', $result->driver_id)->where('lat', '!=', '0.0')->where('lng', '!=', '0.0')->orderBy('id', 'desc')->first();
            if ($driverRegular != "") 
            {
                $auto = new AutoAllotBookingController;
                $driverDistanceFromPickup = $auto->getRadiantdistance($favoriteLocation->pickup_lat, $favoriteLocation->pickup_lng, $driverRegular->lat, $driverRegular->lng);
                $result['driver_distance_from_pickup'] = round($driverDistanceFromPickup/1000);
            }
        }
        

        return $result;
    }

    # Function : This function is used for get org name 
    # Request : none
    # Response : Json message
    # Author : Vinod Gami
    public function getOrganizationBookingName() 
    {
        $cityIds = Auth::user()->city_permission;
        $cityIds = explode(',', $cityIds);
        $customer = Customer::select('cust_organization', 'cust_business_product', 'id', 'cust_name', 'cust_discount_percent', 'city_id', 'cust_number','cust_email','cust_address')->whereIn('city_id', $cityIds)->get();
        foreach ($customer as $key => $value) 
        {
            $customerID =$value->id;

            $creditLimit = CreditLimit::where('customer_id', $customerID)->first();
            if($creditLimit['credit_limit'] != NULL)
            {
                $value['credit_limit'] = $creditLimit['credit_limit'];    
            }
            else
            {
                $value['credit_limit'] = 0;
            }
            
            $customerLedger = CustomerLedger::where('customer_id',$customerID)->orderBy('id', 'desc')->first();
            if($customerLedger['final_balance'] != NULL)
            {
                $value['final_balance'] = $customerLedger['final_balance'];    
            }
            else
            {
                $value['final_balance'] = 0;
            }
        }
        return $customer;
    }

    # Function : This function is used for get customer information
    # Request : none
    # Response : Json message
    # Author : Vinod Gami
    public function getOrganizationBookingUpdateName()
    {
        $cityIds = Auth::user()->city_permission;
        $cityIds = explode(',', $cityIds);
        $customer = Customer::select('cust_organization', 'id', 'cust_name', 'cust_number')->whereIn('city_id', $cityIds)->get();
        return $customer;
    }

    # Function : This function is used for get customer information
    # Request : none
    # Response : Json message
    # Author : Vinod Gami
    public function getCustomerBookingUpdateDetials(Request $request)
    {
        $dropAddress     = array();
        $pickAddress     = array();
        $mainResultArray = array();
        $data            = $request->all();
        $result = array();
        $result1 = NULL;
        if(isset($data['phone']) && $data['phone'] != '')
        {
            $phone  = $data['phone'];
            $result1 = Customer::select('goods_id','cust_organization', 'cust_business_product', 'id', 'cust_name', 'cust_discount_percent', 'city_id', 'cust_number','cust_email','cust_address','other_goods')->where('cust_number', $phone)->first();
        }
        else if(isset($data['name']) && $data['name'] != '' && $data['name'] != 'NA')
        {
            $customer_name  = $data['name'];
            $result1 = Customer::select('goods_id','cust_organization', 'cust_business_product', 'id', 'cust_name', 'cust_discount_percent', 'city_id', 'cust_number','cust_email','cust_address','other_goods')->where('cust_name','LIKE', '%'.$customer_name.'%')->first();
        }
        else if(isset($data['email']) && $data['email'] != '' && $data['email'] != 'NA')
        {
            $email  = $data['email'];
            $result1 = Customer::select('goods_id','cust_organization', 'cust_business_product', 'id', 'cust_name', 'cust_discount_percent', 'city_id', 'cust_number','cust_email','cust_address','other_goods')->where('cust_email', $email)->first();
        }
        else if(isset($data['organization']) && $data['organization'] != '' && $data['organization'] != 'NA')
        {
            $organization  = $data['organization'];
            $result1 = Customer::select('goods_id','cust_organization', 'cust_business_product', 'id', 'cust_name', 'cust_discount_percent', 'city_id', 'cust_number','cust_email','cust_address','other_goods')->where('cust_organization', $organization)->first();
        }
        if(isset($data['customer_id']) && $data['customer_id'] != '')
        {
            $id  = $data['customer_id'];
            $result1 = Customer::select('goods_id','cust_organization', 'cust_business_product', 'id', 'cust_name', 'cust_discount_percent', 'city_id', 'cust_number','cust_email','cust_address','other_goods')->where('id', $id)->first();
        }

        $today = date("Y-m-d 00:00:00");
        $issetDrop = array();   
        $issetPick = array();
        $goods = '';
        $goodsName = '';
        if($result1 != '')
        {
            if($result1->goods_id!='')
            {
                $result1->goods_id;
                $goods = GoodsType:: where('id','=',$result1->goods_id)->first();
            }

            if($goods !='' )
            {
                $goodsName  =  $goods->goods_name;
            }
        }
        $result1['goods_name'] = $goodsName;
        $result['customer_details'] = $result1;
        if(isset($result1->city_id))
        {
            $cityId = $result1->city_id;
        }
        else
        {
            $cityId = 1;
        }
        $getSetting = MaalgaadiSettings::where('city_id', $cityId)->first();

        $result['allowed_drop_point'] = $getSetting->allowed_drop_point;
        if($result1 != '')
        {
            $booking = Booking::where('customer_id', $result1->id)->where('requirement_time', '>', $today)->get();
            foreach ($booking as $key => $value) 
            {
                array_push($mainResultArray, $value);
            }
            $locationDetials = FavoriteLocation::where('customer_id', $result1->id)->orderBy('id', 'desc')->take(5)->get();
            foreach ($locationDetials as $key => $value) 
            {
                
                if(!isset($issetDrop[$value->drop_location]))
                {
                    $dropAddress[] = array(
                        $value->drop_name, 
                        $value->drop_number, 
                        $value->drop_location, 
                        $value->drop_landmark, 
                        $value->drop_organization, 
                        $value->drop_lat, 
                        $value->drop_lng,
                        $value->booking_id,
                        $value->display
                    );    
                    $issetDrop[$value->drop_location] = 1;
                }
                if(!isset($issetPick[$value->pickup_location]))
                {
                    $pickAddress[] = array(

                        $value->pickup_name, 
                        $value->pickup_number, 
                        $value->pickup_location, 
                        $value->pickup_landmark, 
                        $value->pickup_organization, 
                        $value->pickup_lat, 
                        $value->pickup_lng,
                        $value->booking_id,
                        $value->display
                    );    
                    $issetPick[$value->pickup_location] = 1;
                }
                
            }

            $customerWallet       = CustomerLedger::where('customer_id', $result1->id)->orderBy('id', 'desc')->take(1)->first();
            $creditLimit          = CreditLimit::where('customer_id', $result1->id)->where('approved_by', '!=','0')->first();
            $creditLimitAmount    = 0;
            if(isset($creditLimit->credit_limit))
            {
                $creditLimitAmount      = $creditLimit->credit_limit;
                $result['customer_details']['credit_limit'] = $creditLimitAmount;
            }
            else
            {
                $result['customer_details']['credit_limit'] = 0;   
            }

            $result['drop']   = $dropAddress;
            $result['pick']   = $pickAddress;

            if(isset($customerWallet->final_balance))
            {
                $result['customer_details']['wallet'] = $customerWallet->final_balance;    
            }
            else
            {
                $result['customer_details']['wallet'] = 0;
            }
            
            return $result;
        }
        else
        {
            $result = array();
            $result['error']['message'] = "No record found";
            return $result;
        }
    }


    # Function : This function is used for get Distance which is travelled by driver
    # Request : Booking Id
    # Response : Json message
    # Author : Vinod Gami
    public function getTravelledDistance(Request $request)
    {
        $data = $request->all();
        $bookingId   = NULL;
        $resultArray = array();
        if(isset($data['booking_id']))
        {
            $bookingId = $data['booking_id'];
            $bookingDetials = Booking::select('driver_id')->where('id', $bookingId)->first();
            if($bookingDetials->driver_id != 0 && $bookingDetials->driver_id != '-1')
            {
                $driverRegular  = DriverRegular::select('distance_travelled', 'lat', 'lng')->where('driver_id', $bookingDetials->driver_id)->orderBy('created_at', 'desc')->first();
                if($driverRegular != '')
                {
                    $resultArray['driver_id'] = 0;
                    if(isset($driverRegular->distance_travelled) && $driverRegular->distance_travelled == 0)
                    {
                        $resultArray['distance_travelled'] = $driverRegular->distance_travelled / 1000;    
                    }
                    else
                    {
                        $resultArray['distance_travelled'] = 0;
                    }    
                } else {
                   $resultArray['driver_id'] = $bookingDetials->driver_id;
                   $resultArray['distance_travelled'] = 0; 
                }
                return $resultArray;    
            }
            else
            {
                $resultArray['driver_id'] = $bookingDetials->driver_id;
                $resultArray['distance_travelled'] = 0;
                return $resultArray;
            }
        }
        else
        {
            $array = array();
            $array['error']['message'] = "Booking Id not found!!";
            return $array;            
        }
    }

    # Function : This function is used for get Nearest driver of pick point
    # Request : lat, lng
    # Response : Json message
    # Author : Vinod Gami
    public function getNearestDriver(Request $request)
    {
        $data = $request->all();
        $resultArray = array();
        $lat  = NULL;
        $today= date('Y-m-d').' 00:00:00';
        $lng  = NULL;
        if(isset($data['lat']))
        {
            $lat = $data['lat'];
        }
        else
        {
            $array = array();
            $array['error']['message'] = "Lat is required parameter";
            return $array;
        }

        if(isset($data['lng']))
        {
            $lng = $data['lng'];
        }
        else
        {
            $array = array();
            $array['error']['message'] = "long is required parameter";
            return $array;
        }


        $destination    = $lat.','.$lng;
        $nearestDriversArray = array();                            
        $nearestDriversSet   = array();  
        $newTime = date("Y-m-d H:i:s",strtotime(date("Y-m-d H:i:s")." -3 minutes"));
        $loginDriverData = DriverRegular::select('id', 'driver_id', 'lat', 'lng', 'created_at', 'status')->where('created_at', '>', $newTime)->get();
        
        $driverIdsArray  = array();                                  
        foreach ($loginDriverData as $key => $value) 
        {
            array_push($driverIdsArray, $value['driver_id']);
            if(isset($resultArray[$value['driver_id']]))
            {
                if($resultArray[$value['driver_id']]['created_at'] < $value['created_at'])
                {
                    $resultArray[$value['driver_id']] = $value;
                }
            }
            else
            {
                $resultArray[$value['driver_id']] = $value;
            }
        }
        
        $nearestDrivers = array();
        foreach ($resultArray as $key => $value) 
        {
            array_push($nearestDrivers, $value);    
        }

        $driverUpdate = DriverUpdate::whereIn('driver_id', $driverIdsArray)->get();
        $driverUpdateArray  = array();
        foreach ($driverUpdate as $key => $value) 
        {
            if(!isset($driverUpdateArray[$value->driver_id]))
            {
                $driverUpdateArray[$value->driver_id] = $value;
            }
        }
        
        $driverDetialsQuery = Driver::select('*');
        // Filter By vehicle Category 
        if(isset($data['vehicle_category_id']) && !empty($data['vehicle_category_id']))
        {
            $driverDetialsQuery->where('vehicle_category_id', $data['vehicle_category_id']);
        }
        $driverDetialsQuery->whereIn('id', $driverIdsArray);
        $driverDetials = $driverDetialsQuery->get();
        if(!count($driverDetials))
        {
            $result =  array();
            return $result;
        }
        $driverDetialsArray = array();

        foreach ($driverDetials as $key => $value) 
        {
            if(!isset($driverDetialsArray[$value->id]))
            {
                $driverDetialsArray[$value->id] = $value;
            }
        }

        // $rating = DriverRating::select('driver_id','rate')->whereIn('driver_id', $driverIdsArray)->get()->keyBy('driver_id');
        $rating = AverageRating::select('user_id','average_rating as rate')->whereIn('user_id', $driverIdsArray)->where('user_type','driver')->get()->keyBy('user_id');

        $driverLoginDetials = DriverDetials::where('created_at', ">", $today)->whereIn('driver_id', $driverIdsArray)->orderBy('id', 'desc')->get();
        $driverLoginDetialsArray = array();
        foreach ($driverLoginDetials as $key => $value) 
        {
            if(!isset($driverLoginDetialsArray[$value->driver_id]))
            {
                $driverLoginDetialsArray[$value->driver_id] = $value;
            }
        }

        $driverWallet = DriverWallet::whereIn('driver_id', $driverIdsArray)->orderBy('id', 'desc')->get();
        $driverWalletArray = array();
        foreach ($driverWallet as $key => $value) 
        {
            if(!isset($driverWalletArray[$value->driver_id]))
            {
                $driverWalletArray[$value->driver_id] = $value;   
            }
        }

        $vehicleDetail = Vehicle::all();
        $vehicleDetailArray = array();
        foreach ($vehicleDetail as $key => $value) 
        {
            if(!isset($vehicleDetailArray[$value->id]))
            {
                preg_match_all('/\b\w/', $value->vehicle_name, $match);
                $vehicleShortCode = implode($match[0]);
                $value->shortCode = $vehicleShortCode;
                $vehicleDetailArray[$value->id] = $value;
            }
        }
        

        $pushNotification = new PushNotificationController;
        $mainResultArray = array();
        $origins       = NULL;
        foreach ($nearestDrivers as $key => $value) 
        {
            if(array_key_exists($value->driver_id, $driverDetialsArray))
            {
                $driverString = NULL;
                if(isset($driverUpdateArray[$value->driver_id]))
                {
                    $dateResult = $this->timeElapsedString($driverUpdateArray[$value->driver_id]['update_at'], true);
                    $value->last_update = $dateResult;
                }
                else
                {
                    $value->last_update = "NA";   
                }
                
                if(isset($driverDetialsArray[$value->driver_id]['mg_id']))
                {
                    $driverString   = ''.$driverDetialsArray[$value->driver_id]['driver_name'].' ('.$driverDetialsArray[$value->driver_id]['mg_id'].')';  
                }
                else
                {
                    $driverString   = ''.$driverDetialsArray[$value->driver_id]['driver_name'].' (0)';       
                }

                if(isset($driverDetialsArray[$value->driver_id]['mg_id']))
                {
                    $driverString   = ''.$driverDetialsArray[$value->driver_id]['mg_id'].'';    
                }
                else
                {
                    $driverString   = $driverDetialsArray[$value->driver_id]['driver_name'].' (0)';       
                }

                if(isset($vehicleDetailArray[$driverDetialsArray[$value->driver_id]['vehicle_category_id']]))
                {
                    $driverString .= ' ('.$vehicleDetailArray[$driverDetialsArray[$value->driver_id]['vehicle_category_id']]['shortCode'].')';   
                }
                else
                {
                    $driverString .= ' (NA) ';
                }

                if(isset($driverLoginDetialsArray[$value->driver_id]['covered_status']) )
                {
                    if($driverLoginDetialsArray[$value->driver_id]['covered_status'] == 'yes')
                   {
                       $driverString .= ' (C) ';  
                   }
                   else
                   {
                       $driverString .= ' (UC) ';  
                   }
                }
                else
                {
                   $driverString .= ' (UC) ';  
                }

                if(isset($driverLoginDetialsArray[$value->driver_id]['helper_status']))
                {
                    $value->helper_status = $driverLoginDetialsArray[$value->driver_id]['helper_status'];
                    if($driverLoginDetialsArray[$value->driver_id]['helper_status'] == "yes")
                    {
                        $driverString .= ' (H) ';   
                    }
                    else
                    {
                        if(isset($driverLoginDetialsArray[$value->driver_id]['loading_unloading_status']))
                        {
                            $value->load_status = $driverLoginDetialsArray[$value->driver_id]['loading_unloading_status'];
                            if($driverLoginDetialsArray[$value->driver_id]['loading_unloading_status'] == "yes")
                            {
                                $driverString .= ' (L/UL) ';    
                            }
                            else
                            {
                                $driverString .= ' (WL/WUL) ';
                            }
                        }
                        else
                        {
                            $driverString .= ' (WL/WUL) ';
                        }
                    }
                }
                else
                {
                    if(isset($driverLoginDetialsArray[$value->driver_id]['loading_unloading_status']))
                    {
                        $value->load_status = $driverLoginDetialsArray[$value->driver_id]['loading_unloading_status'];
                        if($driverLoginDetialsArray[$value->driver_id]['loading_unloading_status'] == "yes")
                        {
                            $driverString .= ' (L/UL) ';    
                        }
                        else
                        {
                            $driverString .= ' (WL/WUL) ';
                        }
                    }
                    else
                    {
                        $driverString .= ' (WL/WUL) ';
                    }
                }

                if(isset($driverDetialsArray[$value->driver_id]))
                {
                    if($driverDetialsArray[$value->driver_id]['container'] == "yes")
                    {
                        $driverString .= " (CO)"; 
                    }
                }

                if(isset($driverWalletArray[$value->driver_id]))
                {
                    $value->wallet = " (".$driverWalletArray[$value->driver_id]['balance'].")";    
                    $driverString .= " (".$driverWalletArray[$value->driver_id]['balance'].")";
                }
                else
                {
                    $value->wallet = 0;    
                    $driverString .= "(0)";   
                }
                $value->driver_id_status = $driverString;

                if(isset($value->lat) && $value->lat != 0 && isset($value->lng) && $value->lng != 0)
                {
                    //$origins .= $value->lat.','.$value->lng;
                    if(is_null($origins))
                    {
                        $origins .= $value->lat.','.$value->lng;    
                    }
                    else
                    {
                        $origins .= "|".$value->lat.','.$value->lng;    
                    }
                    
                    if(isset($vehicleDetailArray[$driverDetialsArray[$value->driver_id]['vehicle_category_id']]))
                    {
                        $value->vehicle_name = $vehicleDetailArray[$driverDetialsArray[$value->driver_id]['vehicle_category_id']]['vehicle_name'];
                    }
                    
                    $value->name   = $driverDetialsArray[$value->driver_id]['driver_name'];
                    $value->number = $driverDetialsArray[$value->driver_id]['driver_number'];
                    $value->is_prime = $driverDetialsArray[$value->driver_id]['is_prime'];
                }
                
                if($value['status'] == "free")
                {
                    array_push($mainResultArray, $value);
                }
            }
        }

        $url           = "https://maps.googleapis.com/maps/api/distancematrix/json?".Config::get('constants.keyValue')."=".Config::get('constants.googleserverkey')."&origins=".$destination."&destinations=".$origins;
        $json          = @file_get_contents($url); 
        $data          = json_decode($json); 
        
        $arrayDistanceResult = array();
        $i = 0;
        foreach ($data as $key => $value1)
        {
            if($key == "rows")
            {
                foreach ($value1 as $key => $value12) {
                    if($key == "elements")
                    {
                        foreach ($value12 as $key => $res) 
                        {
                            foreach ($res as $key => $value1) 
                            {
                                array_push($arrayDistanceResult, $value1);     
                            }
                        }
                    }
                }
            }
        }
        
        $mainResultDistanceArray = array();
        foreach ($arrayDistanceResult as $key => $val)
        {
            $array = (array)$val;
            $res1  = array();
            $res1['distanceMeter'] = $array['distance']->text;  
            $res1['distance']      = $array['distance']->value;
            $res1['time']          = $array['duration']->text; 
            $res1['timeText']      = $array['duration']->value;

            array_push($mainResultDistanceArray, $res1);
        }
        
        $array1 = array();
        $j = 0;
        foreach ($nearestDrivers as $key => $value) 
        {
            if(array_key_exists($value->driver_id, $driverDetialsArray))
            {
                $distanceMeter = $mainResultDistanceArray[$j]['distanceMeter']; 
                $distance      = $mainResultDistanceArray[$j]['distance']; 
                $time          = $mainResultDistanceArray[$j]['time']; 
                $timeText      = $mainResultDistanceArray[$j]['timeText']; 
                $today         = date('Y-m-d').' 00:00:00';
                
                $value->distanceMeter = $distance;
                $distanceMeter        = $distance / 1000;
                $value->distance      = round($distanceMeter + (($distanceMeter * 10)/100) , 2);
                $value->time_sec      = $timeText;
                $value->time          = $time;
                $j++;
            }
            if(isset($rating[$value->driver_id]))
            {
                $value->rate = $rating[$value->driver_id]['rate'];
            }
            else
            {
                $value->rate = 5;
            }
        }
        
        return $mainResultArray;
    }

    
    # Function : This function is used for convert time and date format
    # Request : Vehicle , customer and Booking Details
    # Response : Json message
    # Author : Vinod Gami 
    public function timeElapsedString($datetime, $full = false) 
    {
        $time = time() - strtotime($datetime); // to get the time since that moment
        $time = ($time<1)? 1 : $time;
        $tokens = array (
            60 => 'minute',
            1 => 'second'
        );
        foreach ($tokens as $unit => $text) 
        {
            if ($time < $unit) continue;
            $numberOfUnits = floor($time / $unit);
            return $numberOfUnits.' '.$text.(($numberOfUnits>1)?'s':'');
        }
    }

    # Function : This function is used for convert time and date format
    # Request : Vehicle , customer and Booking Details
    # Response : Json message
    # Author : Vinod Gami 
    public function getDriverTrack(Request $request)
    {
        $data = $request->all();
        if(isset($data['driver_id']))
        {
            $driverId  = $data['driver_id'];
            $driverRegularDetials = DriverRegular::where('driver_id', $driverId)->orderBy('id', 'desc')->first();
            if($driverRegularDetials != "")
            {
                $result = array();
                $result['success']['message'] = "Successfully location find";
                $result['success']['data']    = $driverRegularDetials;
                return $result;    
            }
            else
            {
                $result = array();
                $result['error']['message'] = "Error Data not found!";
                return $result;       
            }
            
        }
    }

    # Function : This function is used for search booking and get Booking List
    # Request : Vehicle , customer and Booking Details
    # Response : Json message
    # Author : Vinod Gami 
    # Modify By : Vinod 
    public function allBookingSearch(Request $request)
    {
        $bookingIdsArray         = array();
        $customerIdsArray        = array();
        $arrayCustomerIsset      = array();
        $favoriteLocationIds     = array();
        $driverIdsArray          = array();
        $arrayDriverIsset        = array();
        $employeeIdsArray        = array();
        $arrayEmployeeIsset      = array();
        $allotmentBookingDetail  = array();
        $time                    = (date('Y-m-d H:i:s', strtotime('1 hour')));
        $employeeId              = Auth::user()->id;
        $position                = Auth::user()->position;
        $data                    = $request->all();
        $booking_id              = '';  
        $customer_name           = ''; 
        $customer_org            = '';  
        $status                  = 'all'; 
        $type                    = '10';
        $bookingManageEmployeeId = '';
        $cityId                  = '';
        $bookingId               = '';
        $customerId              = '';
        $bookingManageEmployeeId = '';
        $currentTime             = (date('Y-m-d H:i:s'));
        if(isset($data['type'])) 
        {
            $type = $data['type'];
        }  
        
        if(isset($data['booking_id']) && $data['booking_id'])
        {
            $bookingId = $data['booking_id'];
        } 
        
        if(isset($data['customer_name']) && $data['customer_name'])
        {
            $customer_name = $data['customer_name'];
        } 
        
        if(isset($data['customer_org']) && $data['customer_org'])
        {
            $customer_org = $data['customer_org'];
        } 

        if(isset($data['status']) &&  $data['status'])
        {
            $status = $data['status'];
        } 

        if(isset($data['customer_id']) &&  $data['customer_id'])
        {
            $customerId = $data['customer_id'];
        } 

        if(isset($data['city_id']) && $data['city_id'])
        {
            $cityId = $data['city_id'];
        }

        if(isset($data['employee_id']) && $data['employee_id'])
        {
            $bookingManageEmployeeId = $data['employee_id'];
        }

        if(($customer_name != "" ) || $customer_org != "")
        {
            if($status == 'all')
            {
                $query = Booking::select('*');
                if($customerId != '')
                {
                    $query->where('customer_id','=', $customerId);
                }
            }
            else 
            {
                $query = DB::table('booking') ->Join('customer', 'booking.customer_id', '=', 'customer.id')->join('booking_rebook','booking_rebook.booking_id','=','booking.id')->select('booking.*');
                $query ->where('reBook_status','!=','2');
                if($customerId != '')
                {
                    $query->where('customer.id','=', $customerId);
                }
                else if($customer_name!='')
                {
                    $query->where('customer.cust_name','=',$customer_name);
                }
                else
                {
                    if($customer_org!='')
                    {
                        $query->where('customer.cust_organization','=',$customer_org);
                    }
                }
            }
            
            if($cityId)
            {
                 $query->where('booking.city_id', $cityId);
            }
            if($bookingManageEmployeeId)
            {
                $query->where('booking.alloted_to_id','=', $bookingManageEmployeeId);
            }
            
            

            if($bookingId != "" ) 
            {
                $query->where('booking.id','=',$bookingId);
            }
              
            if($status == 'pending')  
            {
                $query->where('booking.driver_id','0')->where('booking.requirement_time','<',$time)->orWhere('book_later',0);
            }
            
            $query->orderBy('booking.id', 'desc');
             //echo $query->toSql();die();
 
        }
        else
        {
           
            $query = Booking::select('*');

            if($cityId)
            {
                 $query->where('booking.city_id', $cityId);
            }
            if($bookingManageEmployeeId)
            {
                $query->where('booking.alloted_to_id','=', $bookingManageEmployeeId);
            }
            if($status == 'pending') 
            {
                $query ->where('driver_id','0')->where('requirement_time','<',$time);
                $query->orderBy('booking.id', 'desc');
            }
            else if($bookingId != "" ) 
            {
                $query->where('booking.id', '=', $bookingId);
            }
            else if($status == 'rebook') 
            {
                $query->join('booking_rebook','booking_rebook.booking_id','booking.id')->where('booking_rebook.reBook_status','1');
                $query->orderBy('booking.id', 'desc');
            }
            else
            {
                $query->orderBy('booking.id', 'desc');
            }
        }
        
        $booking = $query->paginate($type);
        $paginationDetail = $booking->toArray();
        unset($paginationDetail['data']);

        $driverCodeArray = Driver::all();
        $driverCodeSetArray = array();
        foreach ($driverCodeArray as $key => $value) 
        {
            if(!isset($driverCodeSetArray[$value->mg_id]))
            {
                $driverCodeSetArray[$value->mg_id] = $value;   
            }
        }

        foreach ($booking as $key => $value) 
        {
            if(isset($value->reBook_status))
            {
                $value->id = $value->booking_id;
            }
            array_push($bookingIdsArray, $value->id);
            if(!isset($arrayCustomerIsset[$value->customer_id]))
            {
                array_push($customerIdsArray, $value->customer_id);   
                $arrayCustomerIsset[$value->customer_id] = 1;
            }
            
            if($value->allotment_type == 1)
            {
                $value->allotment_text = "Manual";
            }
            else
            {
                $value->allotment_text = "Automatic";
            }

            if($value->driver_id =='-1' && $value->mg_code != '')
            {
                if(isset($driverCodeSetArray[$value->mg_code]))
                {
                    $value->driver_id = $driverCodeSetArray[$value->mg_code]['id'];
                }
                else
                {
                    $value->driver_id = 'NA';   
                }
            }

            if(!isset($arrayDriverIsset[$value->driver_id]))
            {
                array_push($driverIdsArray, $value->driver_id);   
                $arrayDriverIsset[$value->driver_id] = 1;
            }
            
            if(!isset($arrayEmployeeIsset[$value->employee_id]))
            {
                array_push($employeeIdsArray, $value->employee_id);   
                $arrayEmployeeIsset[$value->employee_id] = 1;
            }
        }

        $employeeDetailsArray = array();
        $employeeDetailsData = User::select('id', 'name')->get();
        foreach ($employeeDetailsData as $key => $value) {
            if(!isset($employeeDetailsArray[$value->id]))
            {
                $employeeDetailsArray[$value->id] = $value;
            }
        }

        $driverDetails = Driver::select('id', 'driver_name', 'driver_number', 'vehicle_category_id')->where('driver_status', 'active')->get();
        $driverDetailsArray = array();
        foreach ($driverDetails as $key => $value) {
            $driverDetailsArray[$value->id] = $value;
        }

        $vehicle = Vehicle::select('id', 'vehicle_name')->get();
        $vehicleArray = array();
        foreach ($vehicle as $key => $value) {
            $vehicleArray[$value->id] = $value;
        }

        $cancelBookingArray   = array();
        $cancelBookingDetials = array();
        $cancelBookingDetials = DashboardNotification::whereIn('booking_id', $bookingIdsArray)->get();

        foreach ($cancelBookingDetials as $key => $value) 
        {
            if(isset($cancelBookingArray[$value['booking_id']]))
            {
                if(isset($employeeDetailsArray[$value->emp_id]))
                {
                    if($value->emp_id == '44')
                    {
                        if(Auth::check())   
                        {
                            $value->emp_id = Auth::user()->id;
                            $value->employee_name = "Customer";       
                        }
                        else
                        {
                            $value->employee_name = $employeeDetailsArray[$value->emp_id]['name'];       
                        }
                    }
                    else
                    {
                        $value->employee_name = $employeeDetailsArray[$value->emp_id]['name'];
                    }
                    
                }
                else
                {
                    $value->employee_name = "Automatic";
                }

                if(isset($driverDetailsArray[$value->driver_id]))
                {
                    
                    $value->vehicle = $vehicleArray[$driverDetailsArray[$value->driver_id]['vehicle_category_id']]['vehicle_name']; 
                }
                else
                {
                    $value->vehicle= "NA";
                }

                array_push($cancelBookingArray[$value['booking_id']], $value);
            }
            else
            {
                if(isset($employeeDetailsArray[$value->emp_id]))
                {
                    $value->employee_name = $employeeDetailsArray[$value->emp_id]['name'];
                }
                else
                {
                    $value->employee_name = "Automatic";
                }

                if(isset($driverDetailsArray[$value->driver_id]))
                {
                    $value->vehicle = $vehicleArray[$driverDetailsArray[$value->driver_id]['vehicle_category_id']]['vehicle_name']; 
                }
                else
                {
                    $value->vehicle= "NA";
                }
                $cancelBookingArray[$value['booking_id']] = array();
                array_push($cancelBookingArray[$value['booking_id']], $value);
            }
        }
        
        $driverIdentityArray = array();
        $driverDetails = Driver::select('id', 'driver_name', 'driver_number','mg_id')->whereIn('id', $driverIdsArray)->get();
        $driverDetailsArray = array();
        foreach ($driverDetails as $key => $value) 
        {
            $driverDetailsArray[$value->id] = $value;
            $driverIdentityArray[$value->id] = $value;
        }
        $customerDetials = Customer::select('id', 'cust_name', 'cust_number', 'cust_email', 'cust_organization', 'cluster_number')->whereIn('id', $customerIdsArray)->get();
        $customerDetialsArray = array();
        foreach ($customerDetials as $key => $value) {
            $customerDetialsArray[$value->id] = $value;
        }

        $favoriteLocation = FavoriteLocation::whereIn('booking_id', $bookingIdsArray)->get();
        $favoriteLocationArray = array();
        foreach ($favoriteLocation as $key => $value) {
            $favoriteLocationArray[$value->booking_id] = $value;
        }

        $vehicle = Vehicle::select('id', 'vehicle_name')->get();
        $vehicleArray = array();
        foreach ($vehicle as $key => $value) {
            $vehicleArray[$value->id] = $value;
        }
        $currentBookingStatus = BookingStatus::whereIn('booking_id', $bookingIdsArray)->get();
        $currentBookingStatusArray = array();
        foreach ($currentBookingStatus as $key => $value) {
            $currentBookingStatusArray[$value->booking_id] = $value;
        }

        $bookingCustomerDetails = BookingCustomerDetails::whereIn('booking_id', $bookingIdsArray)->get();
        $bookingCustomerDetailsArray = array();
        foreach ($bookingCustomerDetails as $key => $value) 
        {
            $bookingCustomerDetailsArray[$value->booking_id] = $value;
        }

        $bookingDriverDetails      = BookingDriverDetails::whereIn('booking_id', $bookingIdsArray)->get();
        $bookingDriverDetailsArray = array();
        foreach ($bookingDriverDetails as $key => $value) 
        {
            $ookingDriverDetailsArray[$value->booking_id] = $value;
        }
        $billingTypeDetails      = BillingType::orderBy('id', 'desc')->get();
        $billingTypeDetailsArray = array();
        foreach ($billingTypeDetails as $key => $value) 
        {
            $billingTypeDetailsArray[$value->id] = $value;
        }

        $cacnelBookingDetialsArray = CancelBooking::whereIn('booking_id', $bookingIdsArray)->get();
        $cacnelBookingSetArray = array();
        foreach ($cacnelBookingDetialsArray as $key => $value) {
            if(!isset($cacnelBookingSetArray[$value->booking_id]))
            {
                $cacnelBookingSetArray[$value->booking_id] = $value;
            }
        }
        
        $currentBookingTime = BookingStatus::whereIn('booking_id', $bookingIdsArray)->get();
        $currentBookingTimeArray = array();
        foreach ($currentBookingTime as $key => $value) {
            if(!isset($currentBookingTimeArray[$value->booking_id]))
            {
                $currentBookingTimeArray[$value->booking_id] = $value;
            }
        }
        $bookingEta = BookingEta::whereIn('booking_id', $bookingIdsArray)->get();
        $bookingEtaArray = array();
        foreach ($bookingEta as $key => $value) {
            $bookingEtaArray[$value->booking_id] = $value;
        }
        //Booking Remarks
        $getRemarks = BookingRemarks::whereIn('key',$bookingIdsArray)->get()->keyBy('key');
        $getRebook = BookingRebook::whereIn('booking_id', $bookingIdsArray)->get()->keyBy('booking_id')->toArray();
        $fy_status = '';

        foreach ($booking as $key => $value) 
        {   
            
            if(isset($employeeDetailsArray[$value->alloted_to_id]))
            {
                $value->employee_name = $employeeDetailsArray[$value->alloted_to_id]['name'];
            }
            else
            {
                $value->employee_name = $employeeDetailsArray[1]['name'];
            }
            $value->reBook_status = 0;
            $value->reBook_class = ""; 
            if($status == 'rebook') 
            {
                $value->reBook_status = 1;
                $value->reBook_class = "reBook";
            }
            
            if(array_key_exists($value->id, $getRebook))
            {
                if($getRebook[$value->id]['reBook_status'] == 1)
                {
                    $value->reBook_class = "reBook";
                    $value->reBook_status = $getRebook[$value->id]['reBook_status'];
                }
            }
            
            $value->requirement_time = date('d-m-Y H:i:s',strtotime($value->requirement_time));

            if(isset($cancelBookingArray[$value->id]))
            {
                $value->cancelledDetials = $cancelBookingArray[$value->id];
            }

            $value->type = $billingTypeDetailsArray[$value->customer_pricing_id]['type'];
            
            //setting customer detials
            if(isset($customerDetialsArray[$value->customer_id]))
            {
                $value->customer_name      = $customerDetialsArray[$value->customer_id]['cust_name'];
                $value->customer_number    = $customerDetialsArray[$value->customer_id]['cust_number'];
                $value->customer_email     = $customerDetialsArray[$value->customer_id]['cust_email'];
                $value->cust_organization  = $customerDetialsArray[$value->customer_id]['cust_organization'];
                $value->cluster_number  = $customerDetialsArray[$value->customer_id]['cluster_number'];
            }

            //pickup and landmarks selection from here
            if(isset($favoriteLocationArray[$value->id]))
            {
                if(isset($favoriteLocationArray[$value->id]['pickup_landmark']))
                {
                    $value->pickup = $favoriteLocationArray[$value->id]['pickup_landmark']; 
                }
                else
                {
                    $value->pickup = "NA";
                }

                if(isset($favoriteLocationArray[$value->id]['drop_landmark']))
                {
                    $value->drop   = $favoriteLocationArray[$value->id]['drop_landmark'];   
                }
                else
                {
                    $value->drop   = "NA";
                }
            }
            else
            {
                $value->pickup = "NA";
                $value->drop   = "NA";
            }

            //vehicle category name selection
            if(isset($vehicleArray[$value->vehicle_id]))
            {
                if($value->covered_required == 1)
                {
                    $value->vehicle = $vehicleArray[$value->vehicle_id]['vehicle_name'].' (C)';
                }
                else
                {
                    $value->vehicle = $vehicleArray[$value->vehicle_id]['vehicle_name'].' (UC)';   
                }
            }

            if($value->driver_id == '-1')
            {
                
                if(isset($driverCodeSetArray[$value->mg_code]))
                {
                    $value->driver_name   = $driverCodeSetArray[$value->mg_code]['driver_name'];
                    $value->driver_number = $driverCodeSetArray[$value->mg_code]['driver_number'];
                    $value->mg_id = $driverCodeSetArray[$value->mg_code]['mg_id'];

                }
                else
                {
                    $value->driver_name   = "NA";
                    $value->driver_number = "NA";   
                    $value->mg_id = "NA";   
                }
            }
            else
            {
                if(isset($driverDetailsArray[$value->driver_id]))
                {
                    $value->driver_name   = $driverDetailsArray[$value->driver_id]['driver_name'];
                    $value->driver_number = $driverDetailsArray[$value->driver_id]['driver_number'];
                }
                else
                {
                    $value->driver_name   = "NA";
                    $value->driver_number = "NA";   
                }

                if(isset($driverIdentityArray[$value->driver_id]))
                {
                    $value->mg_id = $driverIdentityArray[$value->driver_id]['mg_id'];
                }
                else
                {
                    $value->mg_id = "";   
                }
            }
            

            //employee ids settings
            if(isset($employeeDetailsArray[$value->employee_id]))
            {
                $value->booked_by = $employeeDetailsArray[$value->employee_id]['name'];   

            }
            $value->driverReachLate = '';
            if(isset($bookingEtaArray[$value->id]))
            {
                $bookingEtaTime = $bookingEtaArray[$value->id]['estimate_eta'];
                $driverToCustomerTime =  strtotime($currentBookingTimeArray[$value->id]['to_customer_time']);
                $currentTime =  strtotime(date('Y-m-d H:i:s'));
                $interval  = abs($driverToCustomerTime - $currentTime);
                $minutes   = round($interval / 60);
                if($minutes > $bookingEtaTime)
                {
                    $value->driverReachLate = 'driverReachLate';
                }
            }
            if($value->updated_by == 44 || $value->updated_by == 45)
            {
                $value->editBooking = 'editBooking';
            }
            else
            {
                $value->editBooking = '';
            }
            
            if(isset($currentBookingTimeArray[$value->id]))
            {
                $complete = 0;
                $rating = 0;
                $loading_time = 0;
                $start_time = 0; 
                $to_customer = 0;
                $billing_time = 0; 
                $pod_time = 0;
                $stop_time = 0; 
                $scheduleTime = 0;

                if($currentBookingTimeArray[$value->id]['booking_time'] != "")
                {
                    $scheduleTime = strtotime($currentBookingTimeArray[$value->id]['booking_time']);    
                    $scheduleTime = 1;
                }

                if($currentBookingTimeArray[$value->id]['complete'] != "")
                {
                    $complete     = strtotime($currentBookingTimeArray[$value->id]['complete']);  
                    $complete     = 9;
                }
                else
                {
                    $complete     = 0;   
                }
                
                if($currentBookingTimeArray[$value->id]['rating'] != "")
                {
                    $rating = strtotime($currentBookingTimeArray[$value->id]['rating']);  
                    $rating = 8;
                }
                else
                {
                    $rating = 0;   
                }
                
                if($currentBookingTimeArray[$value->id]['loading_time'] != "")
                {
                    $loading_time = strtotime($currentBookingTimeArray[$value->id]['loading_time']);
                    $loading_time = 3;
                    $value->driverReachLate = '';
                }   
                else
                {
                    $loading_time = 0;
                }

                if($currentBookingTimeArray[$value->id]['start_time'] != "")
                {
                    $start_time = strtotime($currentBookingTimeArray[$value->id]['start_time']);
                    $start_time = 4;
                }
                else
                {
                    $start_time = 0;   
                }
                
                if($currentBookingTimeArray[$value->id]['to_customer_time'] != "")
                {
                    $to_customer = strtotime($currentBookingTimeArray[$value->id]['to_customer_time']);
                    $to_customer = 2;
                }
                else
                {
                    $to_customer = 0;   
                }
                
                if($currentBookingTimeArray[$value->id]['billing_time'] != "")
                {
                    $billing_time = strtotime($currentBookingTimeArray[$value->id]['billing_time']);
                    $billing_time = 6;
                }
                else
                {
                    $billing_time = 0;
                }
                
                if($currentBookingTimeArray[$value->id]['pod_time'] != "")
                {
                    $pod_time = strtotime($currentBookingTimeArray[$value->id]['pod_time']);
                    $pod_time = 7;
                }
                else
                {
                    $pod_time = 0;   
                }
                
                if($currentBookingTimeArray[$value->id]['stop_time'] != "")
                {
                    $stop_time = strtotime($currentBookingTimeArray[$value->id]['stop_time']);
                    $stop_time = 5;
                }
                else
                {
                    $stop_time = 0;
                }
                
                $timelog   = array();
                $timelog   = array ("Completed" => $complete, "Rating" => $rating, "Loading" => $loading_time,'On-Trip'=>$start_time ,"To-Customer"=>$to_customer,"Upload-POD"=>$pod_time,"Billing"=>$billing_time,"Unloading"=>$stop_time, "Pending" => $scheduleTime);
                $fy_status = array_search(max($timelog), $timelog);  
                
                if($fy_status =='Completed')
                {  
                    $value->update_time = $currentBookingTimeArray[$value->id]['complete'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['complete']) * 1000;
                }
                else if($fy_status=='Rating')
                {
                    $value->update_time = $currentBookingTimeArray[$value->id]['rating'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['rating']) * 1000;
                } 
                else if($fy_status=='Loading')
                {                    
                    $value->update_time = $currentBookingTimeArray[$value->id]['loading_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['loading_time']) * 1000;
                } 
                else if($fy_status=='On-Trip')
                {                    
                    $value->update_time = $currentBookingTimeArray[$value->id]['start_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['start_time']) * 1000;
                }
                else if($fy_status=='To-Customer')
                {                    
                    $value->update_time = $currentBookingTimeArray[$value->id]['to_customer_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['to_customer_time']) * 1000;

                }
                else if($fy_status=='Upload-POD')
                {                    
                    $value->update_time = $currentBookingTimeArray[$value->id]['pod_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['pod_time']) * 1000;
                }
                else if($fy_status=='Billing')
                {                    
                    $value->update_time = $currentBookingTimeArray[$value->id]['billing_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['billing_time']) * 1000;
                }
                else if($fy_status=='Unloading')
                {                    
                    $value->update_time = $currentBookingTimeArray[$value->id]['stop_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['stop_time']) * 1000;
                }
                else if($fy_status == "Pending")
                {
                    $value->update_time = $currentBookingTimeArray[$value->id]['booking_time'];
                    $value->time = strtotime($currentBookingTimeArray[$value->id]['booking_time']) * 1000;
                }
                else
                {
                    $value->update_time = "NA";
                    $value->time = "NA";   
                }

                if(isset($cacnelBookingSetArray[$value->id]))
                {
                    $value->b_status  ="cancelled"; 
                    $value->driverReachLate = '';
                    
                }
                else
                {
                    $value->b_status =$fy_status;
                }
                
                if($fy_status=='Completed')
                {
                    if(isset($bookingCustomerDetailsArray[$value->id]))
                    {
                        $value->final_booking = $bookingCustomerDetailsArray[$value->id];
                        $value->bill_amount   = $bookingCustomerDetailsArray[$value->id]['loading_charge'] + $bookingCustomerDetailsArray[$value->id]['unloading_charge'] + $bookingCustomerDetailsArray[$value->id]['trip_charge'] + $bookingCustomerDetailsArray[$value->id]['drop_points_charge'] + $bookingCustomerDetailsArray[$value->id]['waiting_time_charge'] + $bookingCustomerDetailsArray[$value->id]['pod_charge'] + $bookingCustomerDetailsArray[$value->id]['actual_surge_charge'] + $bookingCustomerDetailsArray[$value->id]['tip_charge'] - $bookingCustomerDetailsArray[$value->id]['actual_discount_amount'];
                        $value->surge_amount = $bookingCustomerDetailsArray[$value->id]['actual_surge_charge'];
                        $value->discount_amount = $bookingCustomerDetailsArray[$value->id]['actual_discount_amount'];
                        if($bookingCustomerDetailsArray[$value->id]['waiting_charge'] != NULL)
                        {
                            $value->final_booking['waiting_charge'] =  $bookingFinalDataArray[$value->id]['waiting_charge'];  
                        }
                        else
                        {
                            $value->final_booking['waiting_charge'] =  0;
                        }
                    }
                    else
                    {
                        $Prop = $value->final_booking;
                        $Prop['waiting_charge'] = 0;
                    }
                }
                else
                {  
                    if(isset($bookingCustomerDetailsArray[$value->id]))
                    {                    
                        $value->final_booking = $bookingCustomerDetailsArray[$value->id];
                        $value->final_booking['waiting_charge'] = 0;
                         $value->bill_amount   = $bookingCustomerDetailsArray[$value->id]['loading_charge'] + $bookingCustomerDetailsArray[$value->id]['unloading_charge'] + $bookingCustomerDetailsArray[$value->id]['trip_charge'] + $bookingCustomerDetailsArray[$value->id]['drop_points_charge'] + $bookingCustomerDetailsArray[$value->id]['waiting_time_charge'] + $bookingCustomerDetailsArray[$value->id]['pod_charge'] + $bookingCustomerDetailsArray[$value->id]['estimate_surge_charge'] + $bookingCustomerDetailsArray[$value->id]['tip_charge']  - $bookingCustomerDetailsArray[$value->id]['estimate_discount_amount  '];
                        $value->surge_amount = $bookingCustomerDetailsArray[$value->id]['estimate_surge_charge'];
                        $value->discount_amount = $bookingCustomerDetailsArray[$value->id]['estimate_discount_amount'];
                    }
                    else
                    {
                        $Prop = array();
                        $Prop['waiting_charge'] = 0;
                    }
                }
            }
            if(isset($getRemarks[$value->id])){
                $value->remark_status = 'remarkYes';
            } else {
                $value->remark_status = 'remarkNo'; 
            }

             $allotmentBookingDetail[] = $value; 
        }

         
        $resultArray['success'] = true;
        $resultArray['pagination'] = (object)$paginationDetail;
        $resultArray['data']  = $allotmentBookingDetail;
        return $resultArray;
    }

    # Function : This function is used for search booking Exist
    # Request : Booking Id
    # Response : Json message
    # Author : Vinod Gami 
    # Modify By : Vinod 
    public function isBookingExist($id)
    {
        $bookingDetials = Booking::find($id);
        if($bookingDetials != "")
        {
            $resultArray['success']['message'] = "Booking id found!!";
            return $resultArray;
        }
        else
        {
            $resultArray['error']['message'] = "Booking id not found!!";
            return $resultArray;
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
        $customerOrganization = $customer->cust_organization;


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
                if (($value->apply_on_number_of_booking > $completedBookingCount) && ($value->apply_on_number_of_days > $daysCount)) 
                {
                    array_push($applyOnFirstNoOfBookingIdsArray, $value->id);
                }               
            }
        }
        
        $query = DiscountCouponCode::select('*'); 
        $query->where("valid_from","<=",$validFrom)->where("valid_to",">=",$validTo);
        $query->where('status',0)->orderBy('id', 'desc')->where('city_id', $customer->city_id);
        $code = $query->get();

        $specificCustomerCouponIdsArray = array();
        $otherCouponIdsArray = array();
        $platform = 'callcentre';
        foreach ($code as $key => $value) 
        {
            $applicableOn = json_decode($value->applicable_on);
            if (in_array($platform, $applicableOn))
            {
                if ($value->customer_data != "" || $value->customer_data != NULL) 
                {
                    $customerData = json_decode($value->customer_data, true);

                    if (in_array($customerOrganization, $customerData))
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
        $couponCodeListArray = DiscountCouponCode::select('id','discount_code','description')->whereIn('id', $finalIdsArray)->orderBy('id', 'desc')->get();

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

        if(isset($data['surge']) && $data['surge'] != '')
        {
            $surge = $data['surge'];
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
        $customer  = Customer::select('cust_organization', 'city_id')->where('id', $customerId)->first();
        $cityId    = $customer->city_id;
        $customerOrganization = $customer->cust_organization;
        

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

                if (!in_array($customerOrganization, $customerData))
                {
                    $response['success'] = false;
                    $response['message'] = "Invalid coupon code.";
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

                $countMultipleUsePerDay = count($multipleUsePerDay);
                if($codeData->multiple_use_per_day <= $countMultipleUsePerDay && $codeData->multiple_use_per_day != 0)
                {
                    $response['success'] = false;
                    $response['message'] = "Coupon code can only be used ".$codeData->multiple_use_per_day." a day.";
                    $response['data']    = (object) array();
                    return $response;
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
                $timeTo      = date('Y-m-d').' '.$codeData->time_to;
                $timeTo      = strtotime($timeTo);
                $timeFrom    = date('Y-m-d').' '.$codeData->time_from;
                $timeFrom    = strtotime($timeFrom);
                $currentTime = date('Y-m-d H:i:s');
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
        
        if($finalBill < 0)
        {
            $finalBill = 0;
        }
        $finalBill = $totalLowerTripCharge - $discountAmount;
        $dataArray = array(
                        'discount_code_id' => $codeData->id,
                        'discount_amount' => $discountAmount,
                        'final_bill' => $finalBill,
                    );

        $response['success'] = true;
        $response['message'] = "Coupon code applied successfully.";
        $response['data']    = $dataArray;
        return $response;
    }
}
