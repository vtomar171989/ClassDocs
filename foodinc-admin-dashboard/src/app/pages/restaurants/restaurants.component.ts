import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BaseUrls } from 'src/app/base-urls';
import { AwsService } from 'src/app/services/aws.service';
import { DbService, Response } from 'src/app/services/db.service';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css']
})
export class RestaurantsComponent implements OnInit {

  loader: boolean = false;
  updation: boolean = false;

  restaurants: any[] = [];
  tempImageFiles: any[] = [];

  restaurantForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private db: DbService,
    private aws: AwsService,
    private http: HttpClient,
    private modalService: NgbModal,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.db.getRestaurants();
    this.db.restaurants.subscribe((list) => {
      if(list.length !== 0) this.restaurants = list;
    });
  }

  openRestaurantModal(modalRef: any, restaurantModel: any = null) {
    this.modalService.open(modalRef, { size: 'xl' });
    this.tempImageFiles = [];
    this.initializeForm(restaurantModel);
  }

  initializeForm(restaurantModel: any) {
    if(restaurantModel === null) {
      this.updation = false;
      this.restaurantForm = this.fb.group({
        restaurantId: [null],
        name: [null],
        description: [null],
        address: [null],
        email: [null],
        contact: [null],
        images: this.fb.array([]),
        thumbnailImage: [0],
        rating: [0],
        status: [1],
        addedOn: [new Date()],
      });
    } else {
      this.updation = true;
      this.restaurantForm = this.fb.group({
        restaurantId: [restaurantModel.restaurantId],
        name: [restaurantModel.name],
        description: [restaurantModel.description],
        address: [restaurantModel.address],
        email: [restaurantModel.email],
        contact: [restaurantModel.contact],
        images: [restaurantModel.images],
        thumbnailImage: [restaurantModel.thumbnailImage],
        rating: [restaurantModel.rating],
        status: [restaurantModel.status],
        addedOn: [new Date(restaurantModel.addedOn)]
      });
      this.tempImageFiles = restaurantModel['images'] || [];
    }
  }

  checkImageFileType(event) {
    let fileList: File[] = Object.assign([], event.target.files);
    fileList.forEach((file: any, idx: number) => {
      if (
        file.type == "image/png" ||
        file.type == "image/jpeg" ||
        file.type == "image/jpg"
      ) {
        this.tempImageFiles.push(file);
      } else {
        this.toast.warning("Only .png/.jpeg/.jpg file format accepted!!", file.name + " will not accepted.");
      }
    });
  }

  checkFileType(value: any) {
    return typeof value !== 'string' ? value.name : String(value).substring(String(value).lastIndexOf("/")).replace("/", "");
  }

  removeImage(idx) {
    let urlString = this.tempImageFiles[idx];
    if(typeof urlString === "string") {
      const s3Ref = this.aws.getS3Ref();
      s3Ref.deleteObject(
        { Bucket: this.aws.BUCKET_NAME, Key: String(urlString).substring(String(urlString).lastIndexOf("/")) }, 
        (error, response) => {
          if(error) this.toast.warning("Something Went Wrong!! Please Try Again...", "Failed")
          if(response) {
            let restaurantId = this.restaurantForm.get("restaurantId").value;
            let thumbnailImageIdx = this.restaurantForm.get("thumbnailImage").value;
            if(thumbnailImageIdx === idx) this.changeThumbnailImageIdx(idx-1);
            this.tempImageFiles.splice(idx, 1);
            this.http.post<Response>(`${BaseUrls.getUpdateUrl(BaseUrls.RESTAURANT_GROUPURL)}/${restaurantId}`, this.tempImageFiles)
              .subscribe({
                next: ({ data }) => {
                  this.toast.success("Image Removed", "Success");
                },
                error: (error) => {
                  this.toast.warning("Something Went Wrong!! Please Try Again...", "Failed")
                }
              })            
          }
        }
      )
    } else {
      this.tempImageFiles.splice(idx, 1);
    }
  }

  changeThumbnailImageIdx(idx) {
    this.restaurantForm.patchValue({
      thumbnailImage: idx
    })
  }

  uploadFileToS3(file: any) {
    return new Promise((resolve, reject) => {
      const s3Bucket = this.aws.getS3Ref();
      const params = {
        Bucket: this.aws.BUCKET_NAME,
        Key: file.name,
        Body: file,
        ACL: 'public-read',
        ContentType: file.type
      }

      s3Bucket.upload(params, {}).send((error, response) => {
        if(error) reject(error);
        if(response) resolve(response);
      })
    })
  }

  async uploadImages(): Promise<any> {
    let imageDownloadedUrl: string[] = [];
    for (let file of this.tempImageFiles) {
      if (file instanceof File) {
        let s3Response = await this.uploadFileToS3(file);
        imageDownloadedUrl.push(s3Response['Location'])
      } else {
        imageDownloadedUrl.push(file);
      }
    }
    return imageDownloadedUrl;
  }

  async saveRestaurant() {
    this.loader = true;
    let values = { ...this.restaurantForm.value };
    values.images = await this.uploadImages();
    
    let formData = new FormData();
    Object.entries(values).forEach(([key, value]: [string, any], idx: number) => formData.append(key, value))
    
    if(!this.updation) {
      this.http.post<Response>(BaseUrls.getAddUrl(BaseUrls.RESTAURANT_GROUPURL), formData)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.restaurants.push(data[0]);
          this.toast.success("Restaurant Added", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.log(error);
          
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
    } else {
      this.http.post<Response>(BaseUrls.getUpdateUrl(BaseUrls.RESTAURANT_GROUPURL), formData)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.restaurants[this.restaurants.findIndex(x => x.restaurantId === data[0].restaurantId)] = { ...data[0] }
          this.toast.success("Restaurant Updated", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          console.log(error);
          
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
    }
    
  }
}
