"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next-nprogress-bar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import CustomButton from "~/components/common/common-button/common-button";
import LoadingSpinner from "~/components/miscellaneous/loading-spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/components/ui/use-toast";
import { getApiUrl } from "~/utils/getApiUrl";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Company email must be a valid email address.",
  }),
  industry: z.string().min(1, {
    message: "Please select an industry.",
  }),
  type: z.string().min(1, {
    message: "Please select an organization type.",
  }),
  country: z.string().min(1, {
    message: "Please select a country.",
  }),
  state: z.string().min(1, {
    message: "Please select a state.",
  }),
  address: z.string().min(1, {
    message: "Please enter company address.",
  }),
});

type FormData = z.infer<typeof formSchema>;

function Organisation() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    const fetchApiUrl = async () => {
      try {
        const url = await getApiUrl();
        setApiUrl(url);
      } catch {
        toast({
          title: "Error",
          description: "Failed to fetch API URL",
          variant: "destructive",
        });
      }
    };

    fetchApiUrl();
  }, [toast]);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      type: "",
      industry: "",
      country: "",
      state: "",
      address: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const payload = {
      ...data,
      user_id: session?.user?.id,
      description: "n/a",
    };
    try {
      await axios.post(`${apiUrl}/api/v1/organizations`, payload, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      toast({
        title: "Organization created successfully",
        description: "Continue to dashboard",
      });
      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 422) {
          const validationErrors = error.response.data.errors || [];
          form.clearErrors();
          validationErrors.forEach(
            (err: { field: string; message: string }) => {
              form.setError(err.field as keyof FormData, {
                type: "manual",
                message: err.message,
              });
            },
          );
        } else {
          toast({
            title: "Error occurred",
            description:
              error.response.data.message ||
              "Failed to submit the form. Please try again.",
          });
        }
      } else {
        toast({
          title: "Error occured",
          description: "An unexpected error occurred.",
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <div>
        <div className="flex-col items-center gap-2 py-4 md:flex">
          <h1 className="text-xl font-bold md:text-2xl">
            Create Organisation Account
          </h1>
          <p className="text-gray-500">
            Create an account to get started with us.
          </p>
        </div>

        <div className="mx-auto md:w-2/4">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company name"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div>
                      <FormLabel>Company Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email address"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4 md:flex-row">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <div className="w-full">
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Technology">
                                Technology
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="flex w-full flex-col gap-2">
                      <div className="w-full">
                        <FormLabel>Organization Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Entertainment">
                                Entertainment
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-md">Company Address</h1>
                <div className="flex flex-col gap-4 md:flex-row">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <div className="w-full">
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nigeria">Nigeria</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <div className="w-full">
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Lagos">Lagos</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <div>
                      <FormLabel>Company Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your company address"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <CustomButton
                type="submit"
                variant="primary"
                size="default"
                className="w-full py-6"
                isDisabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-x-2">
                    <span className="animate-pulse">Processing...</span>{" "}
                    <LoadingSpinner className="size-4 animate-spin sm:size-5" />
                  </span>
                ) : (
                  <span>Create Account</span>
                )}
              </CustomButton>
              <div className="flex justify-center gap-2">
                <p className="text-sm">Already Have An Account?</p>
                <Link className="text-sm text-orange-500" href={"#"}>
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

export default Organisation;
