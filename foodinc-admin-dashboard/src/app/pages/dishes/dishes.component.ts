import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BaseUrls } from 'src/app/base-urls';
import { AwsService } from 'src/app/services/aws.service';
import { DbService, Response } from 'src/app/services/db.service';

@Component({
  selector: 'app-dishes',
  templateUrl: './dishes.component.html',
  styleUrls: ['./dishes.component.css']
})
export class DishesComponent implements OnInit {

  dishForm: FormGroup;
  dishes: any[] = [];
  tempImageFiles: any[] = [];
  restaurantModel: any;

  loader: boolean = false;
  updation: boolean = false;

  @ViewChild("ingredientField", { static: true }) ingredientField: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private db: DbService,
    private aws: AwsService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private modalService: NgbModal,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.db.getDishes();
    this.db.dishes.subscribe((list) => {
      if(list.length !== 0) this.dishes = list;
    })
    this.route.params.subscribe((response: any) => {
      this.getRestaurantModel(response.restaurantId);
    })
  }

  getRestaurantModel(restaurantId: number) {
    this.http.get<Response>(`${BaseUrls.getUrl(BaseUrls.RESTAURANT_GROUPURL)}/${restaurantId}`)
      .subscribe({
        next: ({ data }) => {
          console.log(data);
          this.restaurantModel = Object.assign({}, data[0]);
        },
        error: (error) => {
          console.log(error);
        }
      })
  }

  openDishModal(modalRef: any, dishModel: any = null) {
    this.modalService.open(modalRef, { size: 'xl' });
    this.tempImageFiles = [];
    this.initialiseForm(dishModel);
  }

  initialiseForm(dishModel: any) {
    if(dishModel === null) {
      this.updation = false;
      this.dishForm = this.fb.group({
        dishId: [null],
        restaurantId: [this.restaurantModel?.restaurantId],
        restaurantName: [this.restaurantModel?.name],
        restaurantAddress: [this.restaurantModel?.address],
        name: [null],
        description: [null],
        price: [0],
        rating: [0],
        ingredients: this.fb.array([]),
        images: this.fb.array([]),
        thumbnailImage: [0],
        status: [1],
        addedOn: [new Date()]
      })
    } else {
      this.updation = true;
      this.dishForm = this.fb.group({
        dishId: [dishModel.dishId],
        restaurantId: [dishModel.restaurantId],
        restaurantName: [dishModel.restaurantName],
        restaurantAddress: [dishModel.restaurantAddress],
        name: [dishModel.name],
        description: [dishModel.description],
        price: [dishModel.price],
        rating: [dishModel.rating],
        ingredients: this.fb.array(Array.from(dishModel.ingredients).map(e => this.fb.control(e)) || []),
        images: [dishModel.images],
        thumbnailImage: [dishModel.thumbnailImage],
        status: [dishModel.status],
        addedOn: [new Date(dishModel.addedOn)]
      });

      this.tempImageFiles = dishModel.images || [];
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

  getIngredientsControls = () => this.dishForm.get("ingredients") as FormArray;
  addIngredients = (event) => this.getIngredientsControls().push(this.fb.control(event.target.value))
  removeIngredient = (idx) => this.getIngredientsControls().removeAt(idx);

  removeImage(idx) {
    let urlString = this.tempImageFiles[idx];
    if(typeof urlString === "string") {
      const s3Ref = this.aws.getS3Ref();
      s3Ref.deleteObject(
        { Bucket: this.aws.BUCKET_NAME, Key: String(urlString).substring(String(urlString).lastIndexOf("/")) }, 
        (error, response) => {
          let dishId = this.dishForm.get("dishId").value;
          let thumbnailImageIdx = this.dishForm.get("thumbnailImage").value;
          if(thumbnailImageIdx === idx) this.changeThumbnailImageIdx(idx-1);
          this.tempImageFiles.splice(idx, 1);
          this.http.post<Response>(`${BaseUrls.getUpdateUrl(BaseUrls.DISHES_GROUPURL)}/${dishId}`, this.tempImageFiles)
            .subscribe({
              next: ({ data }) => {
                this.toast.success("Image Removed", "Success");
              },
              error: (error) => {
                this.toast.warning("Something Went Wrong!! Please Try Again...", "Failed")
              }
            })            
          // if(error) this.toast.warning("Something Went Wrong!! Please Try Again...", "Failed")
          // if(response) {
          // }
        }
      )
    } else {
      this.tempImageFiles.splice(idx, 1);
    }
  }

  changeThumbnailImageIdx(idx) {
    this.dishForm.patchValue({
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

  async saveDish() {
    this.loader = true;
    let values = { ...this.dishForm.value };
    values.images =  await this.uploadImages();
    let formData = new FormData();
    Object.entries(values).forEach(([key, value]: [string, any], idx: number) => formData.append(key, value))
    
    if(!this.updation) {
      this.http.post<Response>(BaseUrls.getAddUrl(BaseUrls.DISHES_GROUPURL), formData)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.dishes.push(data[0]);
          this.toast.success("Dish Added", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
    } else {
      this.http.post<Response>(BaseUrls.getUpdateUrl(BaseUrls.DISHES_GROUPURL), formData)
      .subscribe({
        next: ({ data }) => {
          this.loader = false;
          this.dishes[this.dishes.findIndex(x => x.dishId === data[0].dishId)] = { ...data[0] }
          this.toast.success("Dish Updated", "Success");
          this.modalService.dismissAll();
        },
        error: (error) => {
          this.loader = false;
          this.toast.warning("Something went wrong!!", "Failed")
        }
      })
    }
    
  }
}
